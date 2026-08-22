import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import type { Supplier, SupplierInput, SupplierStatus } from "@/types/supplier";

function readString(data: DocumentData, key: string): string {
  return typeof data[key] === "string" ? data[key] : "";
}

function readDate(data: DocumentData, key: string): Date | null {
  return data[key] instanceof Timestamp ? data[key].toDate() : null;
}

function clean(input: SupplierInput): SupplierInput {
  return {
    name: input.name.trim().replace(/\s+/g, " "),
    category: input.category.trim().replace(/\s+/g, " "),
    contactName: input.contactName.trim().replace(/\s+/g, " "),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    address: input.address.trim().replace(/\s+/g, " "),
    notes: input.notes.trim(),
    status: input.status,
  };
}

export async function listSuppliers(organizationId: string): Promise<Supplier[]> {
  const snapshot = await getDocs(
    collection(getFirebaseFirestore(), "organizations", organizationId, "suppliers"),
  );
  return snapshot.docs
    .map((supplierDoc) => {
      const data = supplierDoc.data();
      const status: SupplierStatus =
        readString(data, "status") === "inactive" ? "inactive" : "active";
      return {
        id: supplierDoc.id,
        organizationId,
        name: readString(data, "name") || "Unnamed supplier",
        normalizedName: readString(data, "normalizedName"),
        category: readString(data, "category"),
        contactName: readString(data, "contactName"),
        email: readString(data, "email"),
        phone: readString(data, "phone"),
        address: readString(data, "address"),
        notes: readString(data, "notes"),
        status,
        createdBy: readString(data, "createdBy"),
        updatedBy: readString(data, "updatedBy"),
        createdAt: readDate(data, "createdAt"),
        updatedAt: readDate(data, "updatedAt"),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createSupplier(
  organizationId: string,
  userId: string,
  input: SupplierInput,
): Promise<string> {
  const value = clean(input);
  const created = await addDoc(
    collection(getFirebaseFirestore(), "organizations", organizationId, "suppliers"),
    {
      ...value,
      organizationId,
      normalizedName: value.name.toLowerCase(),
      createdBy: userId,
      updatedBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );
  return created.id;
}

export async function updateSupplier(
  organizationId: string,
  supplierId: string,
  userId: string,
  input: SupplierInput,
): Promise<void> {
  const value = clean(input);
  await updateDoc(
    doc(getFirebaseFirestore(), "organizations", organizationId, "suppliers", supplierId),
    {
      ...value,
      normalizedName: value.name.toLowerCase(),
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function setSupplierStatus(
  organizationId: string,
  supplierId: string,
  userId: string,
  status: SupplierStatus,
): Promise<void> {
  await updateDoc(
    doc(getFirebaseFirestore(), "organizations", organizationId, "suppliers", supplierId),
    {
      status,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    },
  );
}
