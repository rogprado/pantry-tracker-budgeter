import type { ComponentProps, ReactNode } from "react";

type Tone = "white" | "lavender" | "highlight";
const tones: Record<Tone, string> = {
  white: "bg-white border border-lavender-200/70",
  lavender: "bg-lavender border border-lavender-200",
  // The one card that should catch your eye first on a page
  highlight: "bg-gradient-to-br from-white to-soon-soft border border-soon/30",
};

export function Card({
  tone = "white",
  padded = true,
  className = "",
  children,
  ...rest
}: { tone?: Tone; padded?: boolean; children: ReactNode } & ComponentProps<"section">) {
  return (
    <section className={`rounded-card shadow-card ${tones[tone]} ${padded ? "p-6" : ""} ${className}`} {...rest}>
      {children}
    </section>
  );
}

// Small heading inside a card: an optional icon, a title and an optional line under it.
export function CardTitle({ icon, title, sub, action }: { icon?: ReactNode; title: ReactNode; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon && <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lavender-200/70 text-plum">{icon}</span>}
        <div>
          <h2 className="font-display text-xl font-semibold text-eggplant">{title}</h2>
          {sub && <p className="text-sm text-muted">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
