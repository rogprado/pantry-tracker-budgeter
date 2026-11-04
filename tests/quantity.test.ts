import { describe, expect, it } from "vitest";
import { formatAmount, halfOf, stepFor, tidy } from "@/lib/quantity";

describe("quick quantity steps", () => {
  it("uses a sensible step for each unit", () => {
    expect(stepFor("g")).toBe(100);
    expect(stepFor(" Grams ")).toBe(100);
    expect(stepFor("kg")).toBe(0.1);
    expect(stepFor("ml")).toBe(100);
    expect(stepFor("L")).toBe(0.1);
    expect(stepFor("cups")).toBe(1);
    for (const whole of [null, "", "cans", "pack", "bunch", "jar", "tub"]) expect(stepFor(whole)).toBe(1);
  });

  it("halves a 1 kg bag of rice to 0.5 kg and keeps numbers tidy", () => {
    expect(halfOf(1)).toBe(0.5);
    expect(tidy(0.1 + 0.2)).toBe(0.3);
    expect(formatAmount(0.5, "kg")).toBe("0.5 kg");
    expect(formatAmount(3, null)).toBe("3");
  });
});
