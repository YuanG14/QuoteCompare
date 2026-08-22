import type { Metadata } from "next";
import { SupplierDirectory } from "@/components/suppliers/supplier-directory";

export const metadata: Metadata = { title: "Suppliers" };

export default function SuppliersPage() {
  return <SupplierDirectory />;
}
