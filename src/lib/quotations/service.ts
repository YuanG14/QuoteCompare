import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import type {
  Quotation,
  QuotationInput,
  QuotationLineItem,
  QuotationSource,
  QuotationStatus,
} from "@/types/quotation";

function string(data: DocumentData, key: string): string {
  return typeof data[key] === "string" ? data[key] : "";
}
function number(data: DocumentData, key: string): number {
  return typeof data[key] === "number" && Number.isFinite(data[key]) ? data[key] : 0;
}
function date(data: DocumentData, key: string): Date | null {
  return data[key] instanceof Timestamp ? data[key].toDate() : null;
}
function status(value: unknown): QuotationStatus {
  return value === "needs_review" || value === "verified" ? value : "draft";
}
function source(value: unknown): QuotationSource {
  const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const type =
    data.type === "csv" || data.type === "pdf" || data.type === "excel" ? data.type : "manual";
  return {
    type,
    filename: typeof data.filename === "string" ? data.filename : "",
    checksum: typeof data.checksum === "string" ? data.checksum : "",
  };
}
function items(value: unknown): QuotationLineItem[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const data = item as Record<string, unknown>;
    return [
      {
        id: typeof data.id === "string" ? data.id : crypto.randomUUID(),
        rfqItemId: typeof data.rfqItemId === "string" ? data.rfqItemId : "",
        name: typeof data.name === "string" ? data.name : "",
        quantity: typeof data.quantity === "number" ? data.quantity : 0,
        unit: typeof data.unit === "string" ? data.unit : "",
        unitPrice: typeof data.unitPrice === "number" ? data.unitPrice : 0,
        specifications: typeof data.specifications === "string" ? data.specifications : "",
      },
    ];
  });
}

function mapQuotation(id: string, organizationId: string, data: DocumentData): Quotation {
  return {
    id,
    organizationId,
    quotationNumber: string(data, "quotationNumber"),
    rfqId: string(data, "rfqId"),
    rfqNumber: string(data, "rfqNumber"),
    rfqTitle: string(data, "rfqTitle"),
    supplierId: string(data, "supplierId"),
    supplierName: string(data, "supplierName") || "Unknown supplier",
    normalizedSupplierName: string(data, "normalizedSupplierName"),
    currency: "PHP",
    items: items(data.items),
    discount: number(data, "discount"),
    shipping: number(data, "shipping"),
    installation: number(data, "installation"),
    tax: number(data, "tax"),
    warranty: string(data, "warranty"),
    deliveryCommitment: string(data, "deliveryCommitment"),
    paymentTerms: string(data, "paymentTerms"),
    notes: string(data, "notes"),
    source: source(data.source),
    status: status(data.status),
    createdBy: string(data, "createdBy"),
    updatedBy: string(data, "updatedBy"),
    createdAt: date(data, "createdAt"),
    updatedAt: date(data, "updatedAt"),
    submittedAt: date(data, "submittedAt"),
    verifiedAt: date(data, "verifiedAt"),
    verifiedBy: string(data, "verifiedBy"),
  };
}

function clean(input: QuotationInput): QuotationInput {
  return {
    ...input,
    supplierName: input.supplierName.trim().replace(/\s+/g, " "),
    rfqTitle: input.rfqTitle.trim().replace(/\s+/g, " "),
    items: input.items.map((item) => ({
      ...item,
      name: item.name.trim().replace(/\s+/g, " "),
      unit: item.unit.trim().replace(/\s+/g, " "),
      specifications: item.specifications.trim(),
    })),
    warranty: input.warranty.trim(),
    deliveryCommitment: input.deliveryCommitment.trim(),
    paymentTerms: input.paymentTerms.trim(),
    notes: input.notes.trim(),
    source: { ...input.source, filename: input.source.filename.trim() },
  };
}

export async function listQuotations(organizationId: string): Promise<Quotation[]> {
  const snapshot = await getDocs(
    collection(getFirebaseFirestore(), "organizations", organizationId, "quotations"),
  );
  return snapshot.docs
    .map((record) => mapQuotation(record.id, organizationId, record.data()))
    .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
}

export async function getQuotation(
  organizationId: string,
  quotationId: string,
): Promise<Quotation | null> {
  const snapshot = await getDoc(
    doc(getFirebaseFirestore(), "organizations", organizationId, "quotations", quotationId),
  );
  return snapshot.exists() ? mapQuotation(snapshot.id, organizationId, snapshot.data()) : null;
}

export async function createQuotation(
  organizationId: string,
  userId: string,
  input: QuotationInput,
): Promise<string> {
  const value = clean(input);
  const id = `${value.rfqId}_${value.supplierId}`;
  const record = doc(getFirebaseFirestore(), "organizations", organizationId, "quotations", id);
  if ((await getDoc(record)).exists())
    throw new Error("A quotation from this supplier already exists for the selected RFQ.");
  await setDoc(record, {
    ...value,
    organizationId,
    quotationNumber: `QT-${new Date().getUTCFullYear()}-${id.slice(-6).toUpperCase()}`,
    normalizedSupplierName: value.supplierName.toLowerCase(),
    currency: "PHP",
    status: "draft",
    submittedAt: null,
    verifiedAt: null,
    verifiedBy: "",
    createdBy: userId,
    updatedBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function updateQuotation(
  organizationId: string,
  quotationId: string,
  userId: string,
  input: QuotationInput,
): Promise<void> {
  const value = clean(input);
  await updateDoc(
    doc(getFirebaseFirestore(), "organizations", organizationId, "quotations", quotationId),
    {
      ...value,
      normalizedSupplierName: value.supplierName.toLowerCase(),
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function updateQuotationStatus(
  organizationId: string,
  quotationId: string,
  userId: string,
  nextStatus: "needs_review" | "verified",
): Promise<void> {
  const lifecycle =
    nextStatus === "needs_review"
      ? { status: nextStatus, submittedAt: serverTimestamp(), verifiedAt: null, verifiedBy: "" }
      : { status: nextStatus, verifiedAt: serverTimestamp(), verifiedBy: userId };
  await updateDoc(
    doc(getFirebaseFirestore(), "organizations", organizationId, "quotations", quotationId),
    { ...lifecycle, updatedBy: userId, updatedAt: serverTimestamp() },
  );
}
