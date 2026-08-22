export const SUPPLIER_STATUSES = ["active", "inactive"] as const;

export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];

export type Supplier = {
  id: string;
  organizationId: string;
  name: string;
  normalizedName: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: SupplierStatus;
  createdBy: string;
  updatedBy: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type SupplierInput = Pick<
  Supplier,
  "name" | "category" | "contactName" | "email" | "phone" | "address" | "notes" | "status"
>;
