export const AI_CONFIDENCE_THRESHOLD = 0.75;

export const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"] as const;

export type LeadStatusType = (typeof LEAD_STATUSES)[number];

/**
 * Format dynamic values stored in kobo into NGN currency text (e.g. 750000 kobo -> ₦7,500).
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
