import Link from "next/link";
import type { ReactNode } from "react";

// A number that matters, big in Fraunces, with a label and an optional hint.
export function StatCard({ icon, label, value, hint, href }: { icon: ReactNode; label: string; value: string; hint?: ReactNode; href?: string }) {
  const body = (
    <>
      <div className="flex items-center gap-2 text-sm font-medium text-muted">
        <span className="text-plum">{icon}</span>
        {label}
      </div>
      <p className="font-display mt-2 text-[2.75rem] leading-none font-normal text-eggplant">{value}</p>
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
    </>
  );
  const cls = "block rounded-card border border-lavender-200 bg-white p-6";
  return href ? (
    <Link href={href} className={`${cls} transition hover:border-lavender-300 hover:shadow-lift`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
