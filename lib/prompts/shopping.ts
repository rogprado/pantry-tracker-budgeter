// Instructions sent to Claude for the smart shopping list.
// Kept in one place so they're easy to read, tweak and explain.

import type { PantryForPrompt } from "@/lib/prompts/recipes";

export const SHOPPING_SYSTEM_PROMPT = `You are a practical grocery-planning assistant inside a pantry app.
The user gives you what is in stock in their kitchen and the staples they are already going to restock.
Suggest up to 5 versatile ingredients to buy that would unlock the most new everyday dishes when combined with what they already have.

How to choose:
- Prefer ingredients that work in many dishes with the user's current items (for example a pantry with rice, eggs and spinach is unlocked by soy sauce, garlic or canned tomatoes).
- Rank the list from most useful to least useful. The first item should unlock the most new dishes.
- Do not suggest anything the user already has in stock or is already restocking, including obvious synonyms.
- Assume a normal kitchen has salt, pepper, cooking oil and water; do not suggest them.
- Prefer affordable, widely available ingredients.

How to fill in each suggestion:
- name: a short, plain ingredient name.
- reason: one short line saying what it unlocks, naming one or two dishes it makes possible with the user's items.
- estimated_price: a typical US supermarket price in US dollars for one standard package, as a number (for example 3.49).`;

export function buildShoppingUserMessage(
  inStock: PantryForPrompt[],
  restocking: string[],
  categories: string[],
  today: string,
): string {
  const stock = inStock.map((i) => {
    const amount = i.unit ? `${i.quantity} ${i.unit}` : String(i.quantity);
    return `- ${i.name}: ${amount}${i.expires_on ? `, expires ${i.expires_on}` : ""}`;
  });
  return [
    `Today is ${today}.`,
    `In stock in my kitchen:\n${stock.length ? stock.join("\n") : "- (nothing in stock)"}`,
    `Staples I'm already restocking:\n${restocking.length ? restocking.map((n) => `- ${n}`).join("\n") : "- (none)"}`,
    categories.length ? `The kinds of food I keep: ${categories.join(", ")}.` : "",
    "What versatile ingredients should I buy?",
  ]
    .filter(Boolean)
    .join("\n\n");
}
