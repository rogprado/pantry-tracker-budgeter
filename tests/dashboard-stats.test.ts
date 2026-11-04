// Dashboard "spent this month" (PLAN.md, test 2).
// Given three items bought this month for $4, $6 and $10 (one on the 1st) and one bought
// last month for $5, when the dashboard calculates spending this month, then it shows $20.
//
// A plain unit test: spentThisMonth is a pure function that takes today's date as input,
// so no database and no clock are involved.

import { describe, expect, it } from "vitest";
import { spentThisMonth, type StatItem } from "@/lib/stats";

const TODAY = "2026-11-17"; // fixed, so the test gives the same answer on any day

const bought = (price: number, purchased_on: string): StatItem => ({
  price,
  purchased_on,
  expires_on: null,
  in_stock: true,
  category: "Test",
});

describe("dashboard: spent this month", () => {
  it("adds this month's purchases ($4 on the 1st + $6 + $10) and ignores last month's $5", () => {
    const items = [
      bought(4, "2026-11-01"), // first day of this month: must count
      bought(6, "2026-11-09"),
      bought(10, "2026-11-17"), // today: must count
      bought(5, "2026-10-31"), // last day of last month: must not count
    ];

    expect(spentThisMonth(items, TODAY)).toBe(20);
  });
});
