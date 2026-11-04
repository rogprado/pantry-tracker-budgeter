import { describe, expect, it } from "vitest";
import { checkRow, parseDate, tableToRows } from "@/lib/importRows";

const table = [
  ["Name", "Category", "Qty", "Unit", "Price", "Purchased on", "Expires"],
  ["Brown rice", "Grains", "1", "kg", "$3.99", "2026-11-04", "6/1/2027"],
  ["", "", "", "", "", "", ""], // blank row is ignored
  ["", "Dairy", "1", "L", "3.29", "", ""], // missing name
  ["Olive oil", "Oils", "1", "bottle", "-9", "", ""], // negative price
  ["Spinach", "Produce", "2", "handfuls", "", "", ""], // unknown unit
  ["Eggs", "Dairy", "12", "", "4.99", new Date(Date.UTC(2026, 10, 3)), "31/12/2026"], // Excel date + bad date
];

describe("spreadsheet import rows", () => {
  const { rows, missingColumns } = tableToRows(table);
  const checked = rows.map(({ line, raw }) => checkRow(line, raw));

  it("reads friendly header names, skips blank rows and keeps spreadsheet row numbers", () => {
    expect(missingColumns).toEqual([]);
    expect(rows.map((r) => r.line)).toEqual([2, 4, 5, 6, 7]);
  });

  it("accepts a good row and normalises price and dates", () => {
    expect(checked[0].row).toEqual({
      name: "Brown rice", category: "Grains", quantity: 1, unit: "kg", price: 3.99, purchased_on: "2026-11-04", expires_on: "2027-06-01",
    });
  });

  it("flags problems in plain words instead of saving", () => {
    expect(checked[1].row).toBeNull();
    expect(checked[1].problems).toEqual(["Missing name"]);
    expect(checked[2].problems).toEqual(["Price can't be negative"]);
    expect(checked[3].problems[0]).toMatch(/^Unknown unit "handfuls"/);
    expect(checked[4].problems).toEqual(['Expires on "31/12/2026" isn\'t a date. Use 2026-11-04 or 11/4/2026']);
    expect(checked[4].raw.purchased_on).toBe("2026-11-03"); // Excel date cell
  });

  it("reports missing required columns", () => {
    expect(tableToRows([["name", "price"], ["x", "1"]]).missingColumns).toEqual(["category", "quantity"]);
  });

  it("parses dates strictly", () => {
    expect(parseDate("2026-02-30")).toBeNull();
    expect(parseDate("11/4/26")).toBe("2026-11-04");
  });
});
