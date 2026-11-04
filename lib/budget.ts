// Budget calculations. Pure functions, so they can be tested.

export type BudgetLevel = "ok" | "warning" | "over";

export type BudgetStatus = {
  budget: number;
  spent: number;
  percent: number; // spent as a % of budget, rounded down; can go past 100
  left: number; // negative when over budget
  level: BudgetLevel; // ok below 80%, warning from 80% to 100%, over above 100%
};

export const WARNING_AT = 80; // percent

export function budgetStatus(spent: number, budget: number): BudgetStatus {
  const ratio = budget > 0 ? (spent / budget) * 100 : 0;
  const level: BudgetLevel = ratio > 100 ? "over" : ratio >= WARNING_AT ? "warning" : "ok";
  return {
    budget,
    spent,
    percent: Math.floor(ratio), // rounded down, so 79.99% shows 79% and matches the "ok" color
    left: Math.round((budget - spent) * 100) / 100,
    level,
  };
}

// The text a budget field may contain: blank (no budget) or a positive amount up to $100,000.
export function parseBudget(raw: string): { value: number | null } | { error: string } {
  const text = raw.trim().replace(/^\$/, "").replace(/,/g, "");
  if (text === "") return { value: null };
  const n = Number(text);
  if (!Number.isFinite(n)) return { error: "Please enter an amount like 300 or 250.50." };
  if (n <= 0) return { error: "Your budget needs to be more than $0. Leave it blank for no budget." };
  if (n > 100000) return { error: "That's more than $100,000. Please check the amount." };
  return { value: Math.round(n * 100) / 100 };
}
