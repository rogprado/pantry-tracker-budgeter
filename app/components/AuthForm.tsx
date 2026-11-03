"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/auth/actions";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  notice?: string;
};

export default function AuthForm({ mode, action, notice }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isSignup = mode === "signup";

  if (state?.message) {
    return (
      <div className="card">
        <h1 className="text-2xl font-bold text-heading">Check your email</h1>
        <p className="mt-3">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="card space-y-4">
      <h1 className="text-2xl font-bold text-heading">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>

      {notice && !state?.error && <p className="text-sm text-heading">{notice}</p>}
      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <label className="block">
        <span className="text-sm font-semibold">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.email}
          className="input"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold">Password</span>
        <input
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="input"
        />
        {isSignup && <span className="text-xs text-gray-500">At least 6 characters.</span>}
      </label>

      <button type="submit" disabled={pending} className="btn w-full">
        {pending ? "One moment…" : isSignup ? "Sign up" : "Log in"}
      </button>

      <p className="text-center text-sm">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-primary">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
