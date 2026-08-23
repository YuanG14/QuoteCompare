export const PURCHASE_REQUEST_STATUSES = ["draft", "open", "closed"] as const;

export type PurchaseRequestStatus = (typeof PURCHASE_REQUEST_STATUSES)[number];

export type PurchaseRequestItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  specifications: string;
};

export type PurchaseRequest = {
  id: string;
  organizationId: string;
  requestNumber: string;
  title: string;
  normalizedTitle: string;
  requesterName: string;
  department: string;
  purpose: string;
  budget: number;
  requiredDate: string;
  items: PurchaseRequestItem[];
  notes: string;
  status: PurchaseRequestStatus;
  archived: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  archivedAt: Date | null;
};

export type PurchaseRequestInput = Pick<
  PurchaseRequest,
  | "title"
  | "requesterName"
  | "department"
  | "purpose"
  | "budget"
  | "requiredDate"
  | "items"
  | "notes"
  | "status"
>;
