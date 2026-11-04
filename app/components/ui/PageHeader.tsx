import type { ReactNode } from "react";

// Page title in soft Fraunces, a friendly line under it, and actions on the right.
export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-sm font-bold tracking-wide text-plum">{eyebrow}</p>}
        <h1 className="font-display text-4xl font-semibold text-eggplant">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-base text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
