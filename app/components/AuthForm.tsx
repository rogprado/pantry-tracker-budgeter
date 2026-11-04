"use client";

import { MailCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/auth/actions";
import { LogoMark } from "@/app/components/Logo";
import { Button, Field, Input } from "@/app/components/ui";
import kitchen from "@/public/images/kitchen.jpg";

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
      <AuthShell>
        <MailCheck size={40} className="text-plum" aria-hidden="true" />
        <h1 className="font-display mt-4 text-4xl font-semibold text-eggplant">Check your email</h1>
        <p className="mt-3 text-base text-muted">{state.message}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form action={formAction} noValidate className="space-y-5">
        <div>
          <h1 className="font-display text-4xl font-semibold text-eggplant">{isSignup ? "Start your pantry" : "Welcome back"}</h1>
          <p className="mt-2 text-base text-muted">
            {isSignup ? "Keep track of your kitchen, cook with what you have, and stay on budget." : "Let's see what's in your kitchen today."}
          </p>
        </div>

        {notice && !state?.error && <p className="rounded-xl bg-lavender px-4 py-3 text-sm font-semibold text-eggplant">{notice}</p>}
        {state?.error && (
          <p role="alert" className="flex items-center gap-2 rounded-xl bg-expired-soft px-4 py-3 text-sm font-semibold text-expired-ink">
            <span aria-hidden="true">⚠</span>
            {state.error}
          </p>
        )}

        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" defaultValue={state?.email} placeholder="you@example.com" />
        </Field>

        <Field label="Password" help={isSignup ? "At least 6 characters." : undefined}>
          <Input name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} />
        </Field>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "One moment…" : isSignup ? "Create my account" : "Log in"}
        </Button>

        <p className="text-center text-base text-muted">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-bold text-plum hover:text-eggplant">
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

// Split screen: a bright kitchen photo with the brand on one side, the form on the other.
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[620px] overflow-hidden rounded-card border border-lavender-200/70 bg-white shadow-lift md:grid-cols-2">
      <div className="relative hidden md:block">
        <Image src={kitchen} alt="A bright, airy kitchen" fill placeholder="blur" sizes="550px" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-eggplant/85 via-eggplant/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <div className="flex items-center gap-3">
            <LogoMark size={44} />
            <span className="font-display text-3xl font-semibold">Pantry</span>
          </div>
          <p className="font-display mt-4 text-2xl leading-snug">Cook with what you have. Waste less. Spend smarter.</p>
        </div>
      </div>
      <div className="flex flex-col justify-center p-8 sm:p-12">
        <div className="mb-8 flex items-center gap-3 md:hidden">
          <LogoMark size={40} />
          <span className="font-display text-2xl font-semibold text-eggplant">Pantry</span>
        </div>
        {children}
      </div>
    </div>
  );
}
