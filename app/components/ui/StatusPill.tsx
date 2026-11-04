import { CircleAlert, CircleCheck, Clock, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type Tone = "fresh" | "soon" | "expired" | "neutral";

const tones: Record<Tone, { cls: string; Icon: LucideIcon | null }> = {
  fresh: { cls: "bg-fresh-soft text-fresh-ink", Icon: CircleCheck },
  soon: { cls: "bg-soon-soft text-soon-ink", Icon: Clock },
  expired: { cls: "bg-expired-soft text-expired-ink", Icon: CircleAlert },
  neutral: { cls: "bg-lavender-200/70 text-muted", Icon: null },
};

// A small pill that pairs a status color with an icon and a word, never color alone.
export function StatusPill({ tone, children, icon }: { tone: Tone; children: ReactNode; icon?: ReactNode }) {
  const { cls, Icon } = tones[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${cls}`}>
      {icon ?? (Icon && <Icon aria-hidden="true" size={14} strokeWidth={2.5} />)}
      {children}
    </span>
  );
}
