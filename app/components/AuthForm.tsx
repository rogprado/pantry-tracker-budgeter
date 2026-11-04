"use client";

import { MailCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/auth/actions";
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
        <h1 className="font-display mt-4 text-[2.75rem] leading-[1.05] font-normal text-eggplant">Check your email</h1>
        <p className="mt-3 text-base text-muted">{state.message}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form action={formAction} noValidate className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-plum uppercase">{isSignup ? "Create an account" : "Log in"}</p>
          <h1 className="font-display text-[2.75rem] leading-[1.05] font-normal text-eggplant">{isSignup ? "Start your pantry" : "Welcome back"}</h1>
          <p className="mt-2 text-base text-muted">
            {isSignup ? "Keep track of your kitchen, cook with what you have, and stay on budget." : "Let's see what's in your kitchen today."}
          </p>
        </div>

        {notice && !state?.error && <p className="rounded-lg bg-lavender px-4 py-3 text-sm font-medium text-eggplant">{notice}</p>}
        {state?.error && (
          <p role="alert" className="flex items-center gap-2 rounded-lg bg-expired-soft px-4 py-3 text-sm font-medium text-expired-ink">
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
          <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-plum hover:text-eggplant">
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

// Inside the regular layout: the form on the left, a tall kitchen photo on the right.
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-14">
      <div className="flex flex-col justify-center py-4 lg:py-16">{children}</div>
      <figure className="relative hidden min-h-[560px] overflow-hidden rounded-card lg:block">
        <Image src={kitchen} alt="A bright, airy kitchen" fill placeholder="blur" sizes="600px" className="object-cover" priority />
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-8 text-white">
          <p className="font-display text-3xl leading-tight font-normal">Cook with what you have.<br />Waste less. Spend smarter.</p>
        </figcaption>
      </figure>
    </div>
  );
}
