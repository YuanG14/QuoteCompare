import type { PurchaseRequestItem } from "@/types/purchase-request";

export const RFQ_STATUSES = ["draft", "issued", "closed"] as const;
export type RfqStatus = (typeof RFQ_STATUSES)[number];
export type RfqCriterionImportance = "required" | "preferred";

export type RfqCriterion = {
  id: string;
  label: string;
  description: string;
  importance: RfqCriterionImportance;
};

export type RfqSupplier = {
  id: string;
  name: string;
};

export type Rfq = {
  id: string;
  organizationId: string;
  rfqNumber: string;
  purchaseRequestId: string;
  purchaseRequestNumber: string;
  purchaseRequestTitle: string;
  title: string;
  normalizedTitle: string;
  items: PurchaseRequestItem[];
  criteria: RfqCriterion[];
  quotationDeadline: string;
  deliveryDestination: string;
  paymentExpectations: string;
  evaluationCriteria: string;
  selectedSuppliers: RfqSupplier[];
  status: RfqStatus;
  createdBy: string;
  updatedBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  issuedAt: Date | null;
  closedAt: Date | null;
};

export type RfqInput = Pick<
  Rfq,
  | "purchaseRequestId"
  | "purchaseRequestNumber"
  | "purchaseRequestTitle"
  | "title"
  | "items"
  | "criteria"
  | "quotationDeadline"
  | "deliveryDestination"
  | "paymentExpectations"
  | "evaluationCriteria"
  | "selectedSuppliers"
>;
