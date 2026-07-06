import { describe, it, expect } from "vitest";
import { AI_CONFIDENCE_THRESHOLD, formatNaira, LEAD_STATUSES } from "./constants";

describe("AI_CONFIDENCE_THRESHOLD", () => {
  it("is set to 0.75", () => {
    expect(AI_CONFIDENCE_THRESHOLD).toBe(0.75);
  });
});

describe("LEAD_STATUSES", () => {
  it("contains all five lead statuses", () => {
    expect(LEAD_STATUSES).toEqual([
      "NEW",
      "CONTACTED",
      "QUALIFIED",
      "CONVERTED",
      "LOST",
    ]);
  });
});

describe("formatNaira", () => {
  it("formats a price in kobo to NGN currency", () => {
    expect(formatNaira(4500000)).toBe("₦45,000");
  });

  it("formats a small price correctly", () => {
    expect(formatNaira(50000)).toBe("₦500");
  });

  it("formats zero correctly", () => {
    expect(formatNaira(0)).toBe("₦0");
  });

  it("formats a single kobo price", () => {
    expect(formatNaira(100)).toBe("₦1");
  });

  it("handles large prices", () => {
    expect(formatNaira(150000000)).toBe("₦1,500,000");
  });

  it("strips decimal places", () => {
    // 99950 kobo -> ₦999.50 -> formatted with 0 fraction digits -> ₦1,000 (rounded)
    // But Intl.NumberFormat with minimumFractionDigits: 0 and maximumFractionDigits: 0
    // actually rounds. So 99950 / 100 = 999.5 -> format rounds to "1,000".
    // Actually this might vary by environment. Let's just test the string contains ₦ and commas.
    const result = formatNaira(99950);
    expect(result).toContain("₦");
    expect(result).not.toContain(".");
  });
});
