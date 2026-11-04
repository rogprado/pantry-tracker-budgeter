import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import { RECIPES_SYSTEM_PROMPT, buildRecipesUserMessage } from "@/lib/prompts/recipes";
import { RecipesResponseSchema, cleanRecipes } from "@/lib/recipes";
import { todayInTimeZone } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60; // seconds; Claude usually answers well within this

const MODEL = "claude-sonnet-5-5";
const TRY_AGAIN = "We couldn't get recipe ideas right now. Please try again in a moment.";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

// POST /api/recipes/suggest: sends my in-stock items to Claude and returns 3-5 checked recipes.
export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return fail("Please log in again.", 401);

  // RLS limits this to the logged-in user's items.
  const { data: items, error } = await supabase
    .from("pantry_items")
    .select("name, quantity, unit, expires_on")
    .eq("in_stock", true);
  if (error) return fail(TRY_AGAIN, 500);
  if (!items?.length) return fail("Your pantry has nothing in stock yet. Add some items first.", 400);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set");
    return fail(TRY_AGAIN, 500);
  }

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium", format: betaZodOutputFormat(RecipesResponseSchema) },
      // If a safety filter wrongly declines, Anthropic retries on its recommended fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: RECIPES_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildRecipesUserMessage(items, todayInTimeZone()) }],
    });

    if (response.stop_reason === "refusal") {
      console.error("Claude declined the recipe request", response.stop_details);
      return fail(TRY_AGAIN, 502);
    }
    if (response.stop_reason === "max_tokens") {
      console.error("Recipe response was cut off at max_tokens");
      return fail(TRY_AGAIN, 502);
    }

    const recipes = cleanRecipes(response.parsed_output, items.map((i) => i.name));
    if (!recipes) {
      console.error("Recipe response failed validation", JSON.stringify(response.parsed_output));
      return fail(TRY_AGAIN, 502);
    }
    return NextResponse.json({ recipes });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      console.error("Anthropic rejected the API key", err.status, err.message);
    } else if (err instanceof Anthropic.RateLimitError) {
      console.error("Anthropic rate limit", err.message);
      return fail("Lots of requests right now. Please wait a minute and try again.", 429);
    } else if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
    } else {
      console.error("Recipe suggestion failed", err);
    }
    return fail(TRY_AGAIN, 502);
  }
}
