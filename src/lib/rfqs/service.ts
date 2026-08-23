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
import type { PurchaseRequestItem } from "@/types/purchase-request";
import type { Rfq, RfqCriterion, RfqInput, RfqStatus, RfqSupplier } from "@/types/rfq";

function readString(data: DocumentData, key: string): string {
  return typeof data[key] === "string" ? data[key] : "";
}
function readDate(data: DocumentData, key: string): Date | null {
  return data[key] instanceof Timestamp ? data[key].toDate() : null;
}
function readStatus(value: unknown): RfqStatus {
  return value === "issued" || value === "closed" ? value : "draft";
}

function readItems(value: unknown): PurchaseRequestItem[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const data = item as Record<string, unknown>;
    return [
      {
        id: typeof data.id === "string" ? data.id : crypto.randomUUID(),
        name: typeof data.name === "string" ? data.name : "",
        quantity: typeof data.quantity === "number" ? data.quantity : 0,
        unit: typeof data.unit === "string" ? data.unit : "",
        specifications: typeof data.specifications === "string" ? data.specifications : "",
      },
    ];
  });
}

function readCriteria(value: unknown): RfqCriterion[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).flatMap((criterion) => {
    if (!criterion || typeof criterion !== "object") return [];
    const data = criterion as Record<string, unknown>;
    return [
      {
        id: typeof data.id === "string" ? data.id : crypto.randomUUID(),
        label: typeof data.label === "string" ? data.label : "",
        description: typeof data.description === "string" ? data.description : "",
        importance:
          data.importance === "preferred" ? ("preferred" as const) : ("required" as const),
      },
    ];
  });
}

function readSuppliers(value: unknown): RfqSupplier[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).flatMap((supplier) => {
    if (!supplier || typeof supplier !== "object") return [];
    const data = supplier as Record<string, unknown>;
    if (typeof data.id !== "string" || typeof data.name !== "string") return [];
    return [{ id: data.id, name: data.name }];
  });
}

function mapRfq(id: string, organizationId: string, data: DocumentData): Rfq {
  return {
    id,
    organizationId,
    rfqNumber: readString(data, "rfqNumber"),
    purchaseRequestId: readString(data, "purchaseRequestId"),
    purchaseRequestNumber: readString(data, "purchaseRequestNumber"),
    purchaseRequestTitle: readString(data, "purchaseRequestTitle"),
    title: readString(data, "title") || "Untitled RFQ",
    normalizedTitle: readString(data, "normalizedTitle"),
    items: readItems(data.items),
    criteria: readCriteria(data.criteria),
    quotationDeadline: readString(data, "quotationDeadline"),
    deliveryDestination: readString(data, "deliveryDestination"),
    paymentExpectations: readString(data, "paymentExpectations"),
    evaluationCriteria: readString(data, "evaluationCriteria"),
    selectedSuppliers: readSuppliers(data.selectedSuppliers),
    status: readStatus(data.status),
    createdBy: readString(data, "createdBy"),
    updatedBy: readString(data, "updatedBy"),
    createdAt: readDate(data, "createdAt"),
    updatedAt: readDate(data, "updatedAt"),
    issuedAt: readDate(data, "issuedAt"),
    closedAt: readDate(data, "closedAt"),
  };
}

function clean(input: RfqInput): RfqInput {
  return {
    purchaseRequestId: input.purchaseRequestId,
    purchaseRequestNumber: input.purchaseRequestNumber,
    purchaseRequestTitle: input.purchaseRequestTitle.trim().replace(/\s+/g, " "),
    title: input.title.trim().replace(/\s+/g, " "),
    items: input.items.map((item) => ({
      id: item.id,
      name: item.name.trim().replace(/\s+/g, " "),
      quantity: item.quantity,
      unit: item.unit.trim().replace(/\s+/g, " "),
      specifications: item.specifications.trim(),
    })),
    criteria: input.criteria.map((criterion) => ({
      id: criterion.id,
      label: criterion.label.trim().replace(/\s+/g, " "),
      description: criterion.description.trim(),
      importance: criterion.importance,
    })),
    quotationDeadline: input.quotationDeadline,
    deliveryDestination: input.deliveryDestination.trim().replace(/\s+/g, " "),
    paymentExpectations: input.paymentExpectations.trim(),
    evaluationCriteria: input.evaluationCriteria.trim(),
    selectedSuppliers: input.selectedSuppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name.trim().replace(/\s+/g, " "),
    })),
  };
}

export async function listRfqs(organizationId: string): Promise<Rfq[]> {
  const snapshot = await getDocs(
    collection(getFirebaseFirestore(), "organizations", organizationId, "rfqs"),
  );
  return snapshot.docs
    .map((rfqDoc) => mapRfq(rfqDoc.id, organizationId, rfqDoc.data()))
    .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
}

export async function getRfq(organizationId: string, rfqId: string): Promise<Rfq | null> {
  const snapshot = await getDoc(
    doc(getFirebaseFirestore(), "organizations", organizationId, "rfqs", rfqId),
  );
  return snapshot.exists() ? mapRfq(snapshot.id, organizationId, snapshot.data()) : null;
}

export async function createRfq(
  organizationId: string,
  userId: string,
  input: RfqInput,
): Promise<string> {
  const db = getFirebaseFirestore();
  const rfqRef = doc(collection(db, "organizations", organizationId, "rfqs"));
  const value = clean(input);
  const rfqNumber = `RFQ-${new Date().getUTCFullYear()}-${rfqRef.id.slice(0, 6).toUpperCase()}`;
  await setDoc(rfqRef, {
    ...value,
    organizationId,
    rfqNumber,
    normalizedTitle: value.title.toLowerCase(),
    status: "draft",
    issuedAt: null,
    closedAt: null,
    createdBy: userId,
    updatedBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return rfqRef.id;
}

export async function updateRfq(
  organizationId: string,
  rfqId: string,
  userId: string,
  input: RfqInput,
): Promise<void> {
  const value = clean(input);
  await updateDoc(doc(getFirebaseFirestore(), "organizations", organizationId, "rfqs", rfqId), {
    ...value,
    normalizedTitle: value.title.toLowerCase(),
    updatedBy: userId,
    updatedAt: serverTimestamp(),
  });
}

export async function updateRfqStatus(
  organizationId: string,
  rfqId: string,
  userId: string,
  status: "issued" | "closed",
): Promise<void> {
  const lifecycle =
    status === "issued"
      ? { status, issuedAt: serverTimestamp(), closedAt: null }
      : { status, closedAt: serverTimestamp() };
  await updateDoc(doc(getFirebaseFirestore(), "organizations", organizationId, "rfqs", rfqId), {
    ...lifecycle,
    updatedBy: userId,
    updatedAt: serverTimestamp(),
  });
}
