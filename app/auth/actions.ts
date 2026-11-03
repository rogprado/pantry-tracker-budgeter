"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string; email?: string } | undefined;

function readForm(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email && !password) return { email, password, error: "Please enter your email and a password." };
  if (!email) return { email, password, error: "Please enter your email." };
  if (!password) return { email, password, error: "Please enter a password." };
  return { email, password };
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password, error } = readForm(formData);
  if (error) return { error, email };
  if (password.length < 6) return { error: "Your password needs at least 6 characters.", email };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (authError) return { error: friendly(authError.message), email };

  // If email confirmation is on, there is no session until the link is clicked.
  if (!data.session) {
    return { message: "Almost there! Check your email and click the link to finish signing up." };
  }
  redirect("/pantry");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password, error } = readForm(formData);
  if (error) return { error, email };

  const supabase = await createClient();
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) return { error: friendly(authError.message), email };

  redirect("/pantry");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Please try again.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "There's already an account with that email. Try logging in.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link.";
  if (m.includes("invalid") && m.includes("email")) return "That email doesn't look right. Please check it.";
  if (m.includes("password")) return "Please choose a stronger password (at least 6 characters).";
  if (m.includes("rate limit")) return "Too many tries. Please wait a minute and try again.";
  return "Something went wrong. Please try again.";
}
