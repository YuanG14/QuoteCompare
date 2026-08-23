import type { RfqCriterion, RfqSupplier } from "@/types/rfq";
import type { PurchaseRequestItem } from "@/types/purchase-request";

export type RfqSummary = {
  itemLines: number;
  totalQuantity: number;
  requiredCriteria: number;
  preferredCriteria: number;
  invitedSuppliers: number;
};

/** Pure summary logic. The same input always returns the same RFQ counts. */
export function calculateRfqSummary(
  items: readonly PurchaseRequestItem[],
  criteria: readonly RfqCriterion[],
  suppliers: readonly RfqSupplier[],
): RfqSummary {
  return {
    itemLines: items.length,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    requiredCriteria: criteria.filter((criterion) => criterion.importance === "required").length,
    preferredCriteria: criteria.filter((criterion) => criterion.importance === "preferred").length,
    invitedSuppliers: suppliers.length,
  };
}
