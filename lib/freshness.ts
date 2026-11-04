// How fresh an item is, from its expiry date and today ("YYYY-MM-DD"). Pure, so it can be tested.

export type Freshness =
  | { kind: "expired"; days: number } // days since it expired (0 never happens here)
  | { kind: "today" }
  | { kind: "soon"; days: number } // 1-7 days left
  | { kind: "fine" } // more than 7 days left
  | { kind: "none" }; // no expiry date: not perishable

export const SOON_DAYS = 7;

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

export function freshness(expiresOn: string | null, today: string): Freshness {
  if (!expiresOn) return { kind: "none" };
  const days = daysBetween(today, expiresOn);
  if (days < 0) return { kind: "expired", days: -days };
  if (days === 0) return { kind: "today" };
  if (days <= SOON_DAYS) return { kind: "soon", days };
  return { kind: "fine" };
}

// In-stock items to use up first: already expired or expiring within `days`, soonest first.
// Read-only helper for the dashboard's "Use it soon" card.
export function itemsToUseSoon<T extends { in_stock: boolean; expires_on: string | null }>(items: T[], today: string, days = SOON_DAYS): T[] {
  return items
    .filter((i) => i.in_stock && i.expires_on !== null && daysBetween(today, i.expires_on) <= days)
    .sort((a, b) => a.expires_on!.localeCompare(b.expires_on!));
}
