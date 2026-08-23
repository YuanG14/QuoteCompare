import type { PurchaseRequestItem } from "@/types/purchase-request";

export type PurchaseRequestSummary = {
  lineCount: number;
  totalQuantity: number;
};

/** Pure, deterministic summary used by both form previews and saved request views. */
export function calculatePurchaseRequestSummary(
  items: readonly PurchaseRequestItem[],
): PurchaseRequestSummary {
  return items.reduce<PurchaseRequestSummary>(
    (summary, item) => ({
      lineCount: summary.lineCount + 1,
      totalQuantity: summary.totalQuantity + item.quantity,
    }),
    { lineCount: 0, totalQuantity: 0 },
  );
}

export function formatPeso(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
