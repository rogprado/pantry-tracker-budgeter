import type { ReactNode } from "react";

// A friendly empty state that always says what to do next.
export function EmptyState({ icon, title, body, action, compact = false }: { icon: ReactNode; title: string; body: ReactNode; action?: ReactNode; compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center rounded-card border-2 border-dashed border-lavender-300 bg-white/70 text-center ${compact ? "px-6 py-8" : "px-8 py-14"}`}>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-lavender-200/70 text-plum">{icon}</span>
      <h3 className="font-display mt-4 text-2xl font-semibold text-eggplant">{title}</h3>
      <p className="mt-2 max-w-md text-base text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
