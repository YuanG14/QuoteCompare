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
  PurchaseRequest,
  PurchaseRequestInput,
  PurchaseRequestItem,
  PurchaseRequestStatus,
} from "@/types/purchase-request";

function readString(data: DocumentData, key: string): string {
  return typeof data[key] === "string" ? data[key] : "";
}

function readDate(data: DocumentData, key: string): Date | null {
  return data[key] instanceof Timestamp ? data[key].toDate() : null;
}

function readItems(value: unknown): PurchaseRequestItem[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const value = item as Record<string, unknown>;
    return [
      {
        id: typeof value.id === "string" ? value.id : crypto.randomUUID(),
        name: typeof value.name === "string" ? value.name : "",
        quantity: typeof value.quantity === "number" ? value.quantity : 0,
        unit: typeof value.unit === "string" ? value.unit : "",
        specifications: typeof value.specifications === "string" ? value.specifications : "",
      },
    ];
  });
}

function mapPurchaseRequest(
  id: string,
  organizationId: string,
  data: DocumentData,
): PurchaseRequest {
  const rawStatus = readString(data, "status");
  const status: PurchaseRequestStatus =
    rawStatus === "open" || rawStatus === "closed" ? rawStatus : "draft";
  return {
    id,
    organizationId,
    requestNumber: readString(data, "requestNumber"),
    title: readString(data, "title") || "Untitled purchase request",
    normalizedTitle: readString(data, "normalizedTitle"),
    requesterName: readString(data, "requesterName"),
    department: readString(data, "department"),
    purpose: readString(data, "purpose"),
    budget: typeof data.budget === "number" ? data.budget : 0,
    requiredDate: readString(data, "requiredDate"),
    items: readItems(data.items),
    notes: readString(data, "notes"),
    status,
    archived: data.archived === true,
    createdBy: readString(data, "createdBy"),
    updatedBy: readString(data, "updatedBy"),
    createdAt: readDate(data, "createdAt"),
    updatedAt: readDate(data, "updatedAt"),
    archivedAt: readDate(data, "archivedAt"),
  };
}

function clean(input: PurchaseRequestInput): PurchaseRequestInput {
  return {
    title: input.title.trim().replace(/\s+/g, " "),
    requesterName: input.requesterName.trim().replace(/\s+/g, " "),
    department: input.department.trim().replace(/\s+/g, " "),
    purpose: input.purpose.trim(),
    budget: input.budget,
    requiredDate: input.requiredDate,
    items: input.items.map((item) => ({
      id: item.id,
      name: item.name.trim().replace(/\s+/g, " "),
      quantity: item.quantity,
      unit: item.unit.trim().replace(/\s+/g, " "),
      specifications: item.specifications.trim(),
    })),
    notes: input.notes.trim(),
    status: input.status,
  };
}

export async function listPurchaseRequests(organizationId: string): Promise<PurchaseRequest[]> {
  const snapshot = await getDocs(
    collection(getFirebaseFirestore(), "organizations", organizationId, "purchaseRequests"),
  );
  return snapshot.docs
    .map((requestDoc) => mapPurchaseRequest(requestDoc.id, organizationId, requestDoc.data()))
    .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
}

export async function getPurchaseRequest(
  organizationId: string,
  requestId: string,
): Promise<PurchaseRequest | null> {
  const snapshot = await getDoc(
    doc(getFirebaseFirestore(), "organizations", organizationId, "purchaseRequests", requestId),
  );
  return snapshot.exists()
    ? mapPurchaseRequest(snapshot.id, organizationId, snapshot.data())
    : null;
}

export async function createPurchaseRequest(
  organizationId: string,
  userId: string,
  input: PurchaseRequestInput,
): Promise<string> {
  const db = getFirebaseFirestore();
  const requestRef = doc(collection(db, "organizations", organizationId, "purchaseRequests"));
  const value = clean(input);
  const requestNumber = `PR-${new Date().getUTCFullYear()}-${requestRef.id.slice(0, 6).toUpperCase()}`;
  await setDoc(requestRef, {
    ...value,
    organizationId,
    requestNumber,
    normalizedTitle: value.title.toLowerCase(),
    archived: false,
    archivedAt: null,
    createdBy: userId,
    updatedBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return requestRef.id;
}

export async function updatePurchaseRequest(
  organizationId: string,
  requestId: string,
  userId: string,
  input: PurchaseRequestInput,
): Promise<void> {
  const value = clean(input);
  await updateDoc(
    doc(getFirebaseFirestore(), "organizations", organizationId, "purchaseRequests", requestId),
    {
      ...value,
      normalizedTitle: value.title.toLowerCase(),
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function updatePurchaseRequestStatus(
  organizationId: string,
  requestId: string,
  userId: string,
  status: PurchaseRequestStatus,
): Promise<void> {
  await updateDoc(
    doc(getFirebaseFirestore(), "organizations", organizationId, "purchaseRequests", requestId),
    {
      status,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function setPurchaseRequestArchived(
  organizationId: string,
  requestId: string,
  userId: string,
  archived: boolean,
): Promise<void> {
  await updateDoc(
    doc(getFirebaseFirestore(), "organizations", organizationId, "purchaseRequests", requestId),
    {
      archived,
      archivedAt: archived ? serverTimestamp() : null,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    },
  );
}
