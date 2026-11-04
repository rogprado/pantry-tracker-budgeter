// Instructions sent to Claude for "What can I cook?".
// Kept in one place so they're easy to read, tweak and explain.

export type PantryForPrompt = {
  name: string;
  quantity: number;
  unit: string | null;
  expires_on: string | null; // "YYYY-MM-DD"
};

export const RECIPES_SYSTEM_PROMPT = `You are a practical home-cooking assistant inside a pantry app.
The user gives you the items currently in stock in their kitchen. Suggest 3 to 5 recipes they could cook now.

How to choose recipes:
- Build each recipe mostly from the user's items. Keep ingredients they don't have to a few per recipe, and prefer common ones.
- Favor items that expire soonest: the more soon-to-expire items a recipe uses, the better. Put recipes that use them first.
- Assume a normal kitchen has salt, pepper, cooking oil and water; list them as ingredients but mark them as in the pantry.
- Suggest realistic, everyday dishes a home cook can make in under an hour. Make the recipes different from each other.

How to fill in each recipe:
- title: a short, plain dish name.
- minutes: realistic total time in minutes, prep plus cooking, as a whole number.
- servings: how many people it feeds, as a whole number.
- ingredients: every ingredient with an amount (for example "200 g" or "2"). Set in_pantry to true only if it is one of the user's items or a kitchen basic listed above; otherwise false.
- steps: 3 to 8 short steps, one action each, no numbering.
- uses_expiring: the exact names, as written in the user's list, of items expiring within 7 days that this recipe uses. Use an empty list if none.`;

function daysUntil(date: string, today: string): number {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

// The user message: today's date plus one line per in-stock item, soonest expiry first.
export function buildRecipesUserMessage(items: PantryForPrompt[], today: string): string {
  const sorted = [...items].sort((a, b) => (a.expires_on ?? "9999") .localeCompare(b.expires_on ?? "9999"));
  const lines = sorted.map((i) => {
    const amount = i.unit ? `${i.quantity} ${i.unit}` : String(i.quantity);
    let expiry = "no expiry date";
    if (i.expires_on) {
      const d = daysUntil(i.expires_on, today);
      expiry = d < 0 ? `expired ${-d} day(s) ago (${i.expires_on})` : d === 0 ? `expires today (${i.expires_on})` : `expires in ${d} day(s) (${i.expires_on})`;
    }
    return `- ${i.name}: ${amount}, ${expiry}`;
  });
  return `Today is ${today}. These items are in stock in my kitchen:\n${lines.join("\n")}\n\nWhat can I cook?`;
}
