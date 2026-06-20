import { AI_CONFIDENCE_THRESHOLD } from "@/lib/constants";

/**
 * Evaluates the confidence score of an AI response.
 * If the response indicates lack of factual basis, unavailable data, or explicitly suggests human intervention,
 * the confidence score falls below the AI_CONFIDENCE_THRESHOLD (0.75) to trigger manual handoff.
 */
export function scoreResponseConfidence(responseText: string): number {
  const normalizedText = responseText.toLowerCase();

  // 1. Explicit triggers representing "I do not know" or "human handoff needed"
  const lowConfidencePhrases = [
    "don't know",
    "do not know",
    "not sure",
    "can't verify",
    "cannot verify",
    "human manager",
    "vendor will",
    "shop owner will",
    "take over",
    "hold on a second",
    "someone will get back to you",
    "escalate",
    "not in our catalog",
    "unavailable in that color",
    "unavailable in that size",
  ];

  // Check if any low confidence phrases are explicitly present
  let matchCount = 0;
  for (const phrase of lowConfidencePhrases) {
    if (normalizedText.includes(phrase)) {
      matchCount++;
    }
  }

  if (matchCount > 0) {
    // Drop confidence score below threshold
    return 0.4;
  }

  // 2. Scan if the response is too generic or fails to offer actual details
  if (normalizedText.length < 10) {
    return 0.5; // Short responses might be incomplete
  }

  // 3. Fallback default score (high confidence)
  return 0.95;
}

/**
 * Convenience method to check if a score is below threshold.
 */
export function needsHandoff(score: number): boolean {
  return score < AI_CONFIDENCE_THRESHOLD;
}
