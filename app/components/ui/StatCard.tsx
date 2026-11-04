import Link from "next/link";
import type { ReactNode } from "react";

// A number that matters, big in Fraunces, with a label and an optional hint.
export function StatCard({ icon, label, value, hint, href }: { icon: ReactNode; label: string; value: string; hint?: ReactNode; href?: string }) {
  const body = (
    <>
      <div className="flex items-center gap-2 text-sm font-bold text-muted">
        <span className="text-plum">{icon}</span>
        {label}
      </div>
      <p className="font-display mt-3 text-4xl font-semibold text-eggplant">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </>
  );
  const cls = "block rounded-card border border-lavender-200/70 bg-white p-6 shadow-card";
  return href ? (
    <Link href={href} className={`${cls} transition hover:-translate-y-0.5 hover:shadow-lift`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
