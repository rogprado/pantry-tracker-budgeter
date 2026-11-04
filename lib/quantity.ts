// Quick quantity controls: how much one "−" / "+" press changes an item, by its unit.
// Pure, so it can be tested.

const RULES: [RegExp, number][] = [
  [/^(g|gr|grams?)$/, 100],
  [/^(kg|kgs|kilos?|kilograms?)$/, 0.1],
  [/^(ml|millilit(er|re)s?)$/, 100],
  [/^(l|lit(er|re)s?)$/, 0.1],
  [/^cups?$/, 1],
];

// 1 for whole items, cans, packs, bunches, jars and anything unknown.
export function stepFor(unit: string | null | undefined): number {
  const u = (unit ?? "").trim().toLowerCase();
  for (const [re, step] of RULES) if (re.test(u)) return step;
  return 1;
}

// Rounds away floating-point noise (0.1 + 0.2) so quantities stay tidy.
export const tidy = (n: number) => Math.round(n * 1000) / 1000;

export function halfOf(quantity: number): number {
  return tidy(quantity / 2);
}

export function formatAmount(amount: number, unit: string | null | undefined): string {
  const n = tidy(amount);
  return unit ? `${n} ${unit}` : String(n);
}
