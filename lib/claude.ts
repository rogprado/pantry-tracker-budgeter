import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Shared by the Claude routes (recipes, shopping). Server code only.

export const CLAUDE_MODEL = "claude-sonnet-5-5";
export const TRY_AGAIN = "We couldn't get suggestions right now. Please try again in a moment.";

// `code` is a short, non-secret reason shown in small print so problems can be diagnosed from the screen.
export const jsonError = (error: string, status: number, code: string) =>
  NextResponse.json({ error, code }, { status });

// Turns an error thrown by the Anthropic SDK into a friendly JSON response, logging the details.
export function claudeErrorResponse(err: unknown, label: string) {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    console.error(`${label}: Anthropic rejected the API key`, err.status, err.message);
    return jsonError(TRY_AGAIN, 502, `key_rejected_${err.status}`);
  }
  if (err instanceof Anthropic.RateLimitError) {
    console.error(`${label}: Anthropic rate limit`, err.message);
    return jsonError("Lots of requests right now. Please wait a minute and try again.", 429, "rate_limit");
  }
  if (err instanceof Anthropic.APIConnectionError) {
    console.error(`${label}: could not reach Anthropic`, err.message);
    return jsonError(TRY_AGAIN, 502, "connection");
  }
  if (err instanceof Anthropic.APIError) {
    console.error(`${label}: Anthropic API error`, err.status, err.message);
    return jsonError(TRY_AGAIN, 502, `api_${err.status}`);
  }
  console.error(`${label}: failed`, err);
  return jsonError(TRY_AGAIN, 502, err instanceof Error ? `exception_${err.name}` : "unknown");
}
