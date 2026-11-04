import { freshness } from "@/lib/freshness";
import { StatusPill } from "@/app/components/ui/StatusPill";

// "Expired" (red), "Use today" / "3 days left" (amber), or nothing when there's plenty of time or no expiry date.
export function FreshnessPill({ expiresOn, today }: { expiresOn: string | null; today: string }) {
  const f = freshness(expiresOn, today);
  if (f.kind === "expired") return <StatusPill tone="expired">Expired</StatusPill>;
  if (f.kind === "today") return <StatusPill tone="soon">Use today</StatusPill>;
  if (f.kind === "soon") return <StatusPill tone="soon">{f.days === 1 ? "1 day left" : `${f.days} days left`}</StatusPill>;
  return null;
}
