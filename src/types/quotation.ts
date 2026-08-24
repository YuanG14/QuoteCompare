export const QUOTATION_STATUSES = ["draft", "needs_review", "verified"] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];
export type QuotationSourceType = "manual" | "csv" | "pdf" | "excel";

export type QuotationLineItem = {
  id: string;
  rfqItemId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  specifications: string;
};

export type QuotationSource = {
  type: QuotationSourceType;
  filename: string;
  checksum: string;
};

export type Quotation = {
  id: string;
  organizationId: string;
  quotationNumber: string;
  rfqId: string;
  rfqNumber: string;
  rfqTitle: string;
  supplierId: string;
  supplierName: string;
  normalizedSupplierName: string;
  currency: "PHP";
  items: QuotationLineItem[];
  discount: number;
  shipping: number;
  installation: number;
  tax: number;
  warranty: string;
  deliveryCommitment: string;
  paymentTerms: string;
  notes: string;
  source: QuotationSource;
  status: QuotationStatus;
  createdBy: string;
  updatedBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  submittedAt: Date | null;
  verifiedAt: Date | null;
  verifiedBy: string;
};

export type QuotationInput = Pick<
  Quotation,
  | "rfqId"
  | "rfqNumber"
  | "rfqTitle"
  | "supplierId"
  | "supplierName"
  | "items"
  | "discount"
  | "shipping"
  | "installation"
  | "tax"
  | "warranty"
  | "deliveryCommitment"
  | "paymentTerms"
  | "notes"
  | "source"
>;
