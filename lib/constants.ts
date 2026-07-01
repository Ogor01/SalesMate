import { LeadStatus } from "@prisma/client";

export const AI_CONFIDENCE_THRESHOLD = 0.75;

export const LEAD_STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "LOST",
];

/**
 * Format values stored in kobo into NGN currency text (e.g. 75000 kobo -> ₦750).
 */
export function formatNaira(koboPrice: number): string {
  const naira = koboPrice / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(naira)
    .replace("NGN", "₦")
    .trim();
}
