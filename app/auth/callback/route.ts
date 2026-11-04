import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Both the email confirmation link and Google / GitHub sign-in land here.
// Exchange the one-time code for a session, then go to the pantry.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/pantry", request.url));
    console.error("Auth callback: code exchange failed", error.message);
  }
  // The provider sends ?error=... when the person cancels or something goes wrong there.
  const reason = params.get("error") ? "oauth" : "confirm";
  if (params.get("error")) console.error("Auth callback: provider error", params.get("error"), params.get("error_description"));
  return NextResponse.redirect(new URL(`/login?error=${reason}`, request.url));
}
