// Spreadsheet import: turn a table (from .csv or .xlsx) into checked rows.
// Pure, so the browser preview and the server use exactly the same rules.

export const IMPORT_COLUMNS = ["name", "category", "quantity", "unit", "price", "purchased_on", "expires_on"] as const;
export type ImportColumn = (typeof IMPORT_COLUMNS)[number];
export type RawRow = Record<ImportColumn, string>;

export type CleanRow = {
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  purchased_on: string | null; // YYYY-MM-DD
  expires_on: string | null;
};

export type CheckedRow = { line: number; raw: RawRow; row: CleanRow | null; problems: string[] };

export const MAX_ROWS = 500;

// Header spellings people actually use, mapped to our columns.
const HEADER_ALIASES: Record<string, ImportColumn> = {
  name: "name", item: "name", item_name: "name", product: "name",
  category: "category", shelf: "category", type: "category",
  quantity: "quantity", qty: "quantity", amount: "quantity",
  unit: "unit", units: "unit",
  price: "price", cost: "price", price_usd: "price",
  purchased_on: "purchased_on", purchased: "purchased_on", purchase_date: "purchased_on", bought_on: "purchased_on", bought: "purchased_on",
  expires_on: "expires_on", expires: "expires_on", expiry: "expires_on", expiry_date: "expires_on", expiration_date: "expires_on", use_by: "expires_on", best_before: "expires_on",
};

// Units we understand (blank is fine too: it means whole items).
const KNOWN_UNITS = new Set([
  "g", "gram", "grams", "kg", "kgs", "kilo", "kilos", "mg", "ml", "l", "liter", "liters", "litre", "litres",
  "oz", "lb", "lbs", "cup", "cups", "tbsp", "tsp", "can", "cans", "pack", "packs", "packet", "packets",
  "jar", "jars", "bunch", "bunches", "tub", "tubs", "bag", "bags", "bottle", "bottles", "box", "boxes",
  "carton", "cartons", "piece", "pieces", "pc", "pcs", "loaf", "loaves", "dozen", "slice", "slices",
  "head", "heads", "clove", "cloves", "tin", "tins", "roll", "rolls", "stick", "sticks", "each", "x",
]);

const norm = (s: string) => s.trim().toLowerCase().replace(/[\s\-.]+/g, "_").replace(/[^a-z_]/g, "");

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  return String(value).trim();
}

// First non-empty row = headers. Returns rows keyed by our column names, plus any required columns that are missing.
export function tableToRows(table: unknown[][]): { rows: { line: number; raw: RawRow }[]; missingColumns: ImportColumn[] } {
  const headerIndex = table.findIndex((r) => r.some((c) => cellText(c) !== ""));
  if (headerIndex === -1) return { rows: [], missingColumns: ["name", "category", "quantity"] };

  const columnFor = table[headerIndex].map((h) => HEADER_ALIASES[norm(cellText(h))]);
  const present = new Set(columnFor.filter(Boolean));
  const missingColumns = (["name", "category", "quantity"] as ImportColumn[]).filter((c) => !present.has(c));

  const rows = table
    .slice(headerIndex + 1)
    .map((cells, i) => {
      const raw = Object.fromEntries(IMPORT_COLUMNS.map((c) => [c, ""])) as RawRow;
      cells.forEach((cell, j) => {
        const col = columnFor[j];
        if (col && !raw[col]) raw[col] = cellText(cell);
      });
      return { line: headerIndex + i + 2, raw }; // spreadsheet row number, as the user sees it
    })
    .filter(({ raw }) => IMPORT_COLUMNS.some((c) => raw[c] !== ""));
  return { rows, missingColumns };
}

function parseNumber(text: string): number | null {
  const n = Number(text.replace(/[$,\s]/g, ""));
  return text.trim() === "" || !Number.isFinite(n) ? null : n;
}

const pad = (n: number) => String(n).padStart(2, "0");
function validDate(y: number, m: number, d: number): string | null {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? `${y}-${pad(m)}-${pad(d)}` : null;
}

// Accepts 2026-11-04 and US-style 11/4/2026 (or 11/4/26).
export function parseDate(text: string): string | null {
  const t = text.trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/);
  if (m) return validDate(+m[1], +m[2], +m[3]);
  m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (m) return validDate(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[1], +m[2]);
  return null;
}

// Checks one row and explains every problem in plain words.
export function checkRow(line: number, raw: RawRow): CheckedRow {
  const problems: string[] = [];
  const name = raw.name.trim();
  const category = raw.category.trim();
  if (!name) problems.push("Missing name");
  else if (name.length > 100) problems.push("Name is too long (100 characters max)");
  if (!category) problems.push("Missing category");

  let quantity = 0;
  if (!raw.quantity.trim()) problems.push("Missing quantity");
  else {
    const q = parseNumber(raw.quantity);
    if (q === null) problems.push(`Quantity "${raw.quantity}" isn't a number`);
    else if (q < 0) problems.push("Quantity can't be negative");
    else quantity = q;
  }

  const unit = raw.unit.trim();
  if (unit && !KNOWN_UNITS.has(unit.toLowerCase())) {
    problems.push(`Unknown unit "${unit}". Try g, kg, ml, l, cups, cans or packs, or leave it blank`);
  }

  let price: number | null = null;
  if (raw.price.trim()) {
    const p = parseNumber(raw.price);
    if (p === null) problems.push(`Price "${raw.price}" isn't a number`);
    else if (p < 0) problems.push("Price can't be negative");
    else price = Math.round(p * 100) / 100;
  }

  const date = (label: string, text: string) => {
    if (!text.trim()) return null;
    const d = parseDate(text);
    if (!d) problems.push(`${label} "${text}" isn't a date. Use 2026-11-04 or 11/4/2026`);
    return d;
  };
  const purchased_on = date("Purchased on", raw.purchased_on);
  const expires_on = date("Expires on", raw.expires_on);

  return {
    line,
    raw,
    problems,
    row: problems.length ? null : { name, category, quantity, unit: unit || null, price, purchased_on, expires_on },
  };
}

export const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
