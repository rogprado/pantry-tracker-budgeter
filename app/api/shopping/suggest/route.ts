import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import { CLAUDE_MODEL, TRY_AGAIN, claudeErrorResponse, jsonError } from "@/lib/claude";
import { listStaples } from "@/lib/pantry";
import { SHOPPING_SYSTEM_PROMPT, buildShoppingUserMessage } from "@/lib/prompts/shopping";
import { ShoppingResponseSchema, cleanSuggestions } from "@/lib/shopping";
import { todayInTimeZone } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

// POST /api/shopping/suggest: asks Claude for up to 5 versatile ingredients, ranked most useful first.
export async function POST() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return jsonError("Please log in again.", 401, "not_logged_in");

  // All reads go through RLS, so they only see the logged-in user's rows.
  const [stock, staples, categories] = await Promise.all([
    supabase.from("pantry_items").select("name, quantity, unit, expires_on").eq("in_stock", true),
    listStaples().catch(() => null),
    supabase.from("categories").select("name"),
  ]);
  if (stock.error || !staples || categories.error) return jsonError(TRY_AGAIN, 500, "db");

  const inStock = stock.data ?? [];
  const restocking = staples.filter((s) => !s.in_stock).map((s) => s.name);
  if (inStock.length === 0) {
    return jsonError("Your pantry has nothing in stock yet. Add some items first.", 400, "no_items");
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set");
    return jsonError(TRY_AGAIN, 500, "no_key");
  }

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.parse({
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium", format: betaZodOutputFormat(ShoppingResponseSchema) },
      // If a safety filter wrongly declines, Anthropic retries on its recommended fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SHOPPING_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildShoppingUserMessage(
            inStock,
            restocking,
            (categories.data ?? []).map((c) => c.name),
            todayInTimeZone(),
          ),
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      console.error("Claude declined the shopping request", response.stop_details);
      return jsonError(TRY_AGAIN, 502, "declined");
    }
    if (response.stop_reason === "max_tokens") return jsonError(TRY_AGAIN, 502, "cut_off");

    // Drop anything in stock or already on the restock list. Out-of-stock items that aren't
    // staples are fair suggestions: the user doesn't have them right now.
    const suggestions = cleanSuggestions(response.parsed_output, [...inStock.map((i) => i.name), ...restocking]);
    if (!suggestions) {
      console.error("Shopping response failed validation", JSON.stringify(response.parsed_output));
      return jsonError(TRY_AGAIN, 502, "invalid_reply");
    }
    return NextResponse.json({ suggestions });
  } catch (err) {
    return claudeErrorResponse(err, "Shopping suggestion");
  }
}
