import { describe, it, expect } from "vitest";
import { scoreResponseConfidence, needsHandoff } from "./confidence";

describe("scoreResponseConfidence", () => {
  it("returns 0.95 for a confident response", () => {
    const text =
      "Yes! We have the Premium Ankara Set in size L — available in Navy Blue, Burgundy & Forest Green at ₦45,000.";
    expect(scoreResponseConfidence(text)).toBe(0.95);
  });

  it("returns 0.4 when response contains 'don't know'", () => {
    const text = "I don't know the delivery time for your location.";
    expect(scoreResponseConfidence(text)).toBe(0.4);
  });

  it("returns 0.4 when response contains 'do not know'", () => {
    const text = "I do not know the answer to that question.";
    expect(scoreResponseConfidence(text)).toBe(0.4);
  });

  it("returns 0.4 when response contains 'not sure'", () => {
    const text = "I'm not sure about that information.";
    expect(scoreResponseConfidence(text)).toBe(0.4);
  });

  it("returns 0.4 when response suggests human manager handoff", () => {
    const text =
      "Let me pass this to a human manager who can help with that.";
    expect(scoreResponseConfidence(text)).toBe(0.4);
  });

  it("returns 0.4 when response contains 'cannot verify'", () => {
    const text = "I cannot verify the stock status for that item.";
    expect(scoreResponseConfidence(text)).toBe(0.4);
  });

  it("returns 0.4 when response mentions escalation", () => {
    const text =
      "I'll need to escalate this to the shop owner for confirmation.";
    expect(scoreResponseConfidence(text)).toBe(0.4);
  });

  it("returns 0.4 when response says color is unavailable", () => {
    const text = "That option is unavailable in that color.";
    expect(scoreResponseConfidence(text)).toBe(0.4);
  });

  it("returns 0.4 when response says size is unavailable", () => {
    const text = "That option is unavailable in that size.";
    expect(scoreResponseConfidence(text)).toBe(0.4);
  });

  it("returns 0.5 for very short responses (fewer than 10 chars)", () => {
    expect(scoreResponseConfidence("Yes")).toBe(0.5);
    expect(scoreResponseConfidence("OK")).toBe(0.5);
    expect(scoreResponseConfidence("No")).toBe(0.5);
  });

  it("is case-insensitive when detecting low-confidence phrases", () => {
    const text = "I DON'T KNOW the price of that item.";
    expect(scoreResponseConfidence(text)).toBe(0.4);
  });

  it("returns 0.4 for response containing 'not in our catalog'", () => {
    const text = "That product is not in our catalog.";
    expect(scoreResponseConfidence(text)).toBe(0.4);
  });

  it("returns 0.4 for response containing 'someone will get back'", () => {
    const text = "Someone will get back to you shortly.";
    expect(scoreResponseConfidence(text)).toBe(0.4);
  });

  it("returns 0.95 for a complete product answer", () => {
    const text =
      "Our Classic Lace Gown is ₦65,000 and available in White, Champagne, Blush Pink, and Ivory in sizes M to XXL. Would you like to place an order?";
    expect(scoreResponseConfidence(text)).toBe(0.95);
  });
});

describe("needsHandoff", () => {
  it("returns true when score is below threshold (0.75)", () => {
    expect(needsHandoff(0.4)).toBe(true);
    expect(needsHandoff(0.5)).toBe(true);
    expect(needsHandoff(0.7)).toBe(true);
  });

  it("returns false when score is at or above threshold", () => {
    expect(needsHandoff(0.75)).toBe(false);
    expect(needsHandoff(0.8)).toBe(false);
    expect(needsHandoff(0.95)).toBe(false);
    expect(needsHandoff(1.0)).toBe(false);
  });
});
