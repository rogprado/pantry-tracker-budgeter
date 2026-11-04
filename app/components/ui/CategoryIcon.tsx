import { createElement } from "react";
import {
  Beef,
  Cookie,
  Croissant,
  Droplets,
  Flame,
  Leaf,
  Milk,
  Package,
  Snowflake,
  Soup,
  Wheat,
  type LucideIcon,
} from "lucide-react";

// Categories are free text, so match the name by keywords. First match wins; anything else gets a jar-like box.
const RULES: [RegExp, LucideIcon, string][] = [
  [/frozen|freezer|\bice\b/i, Snowflake, "Frozen"],
  [/produce|veg|fruit|green|salad|herb|fresh/i, Leaf, "Produce"],
  [/grain|rice|pasta|bread|cereal|oat|noodle|flour(?!.*bak)/i, Wheat, "Grains"],
  [/dairy|milk|cheese|yog|egg|butter|cream/i, Milk, "Dairy"],
  [/meat|fish|seafood|poultry|chicken|beef|pork|protein|tofu/i, Beef, "Meat & fish"],
  [/\bcan(s|ned)?\b|\btin(s|ned)?\b|\bjars?\b|preserve|soup|bean|legume|chickpea|lentil/i, Soup, "Canned"],
  [/spice|seasoning|salt|pepper/i, Flame, "Spices"],
  [/oil|sauce|condiment|vinegar|dressing/i, Droplets, "Oils & sauces"],
  [/bak|sugar|flour|chocolate/i, Croissant, "Baking"],
  [/snack|sweet|treat|biscuit|cookie|cand(y|ies)|chocolate/i, Cookie, "Snacks"],
];

export function categoryIcon(name: string | null | undefined): LucideIcon {
  if (name) for (const [re, Icon] of RULES) if (re.test(name)) return Icon;
  return Package;
}

export function CategoryIcon({ name, size = "md" }: { name: string | null | undefined; size?: "sm" | "md" | "lg" }) {
  const box = { sm: "h-8 w-8 rounded-lg", md: "h-10 w-10 rounded-xl", lg: "h-12 w-12 rounded-2xl" }[size];
  const px = { sm: 16, md: 20, lg: 24 }[size];
  return (
    <span className={`grid shrink-0 place-items-center bg-lavender-200/70 text-plum ${box}`} aria-hidden="true">
      {createElement(categoryIcon(name), { size: px, strokeWidth: 2 })}
    </span>
  );
}
