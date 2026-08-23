import type { Metadata } from "next";
import { PurchaseRequestDirectory } from "@/components/procurement/purchase-request-directory";

export const metadata: Metadata = { title: "Purchase requests" };

export default function ProcurementPage() {
  return <PurchaseRequestDirectory />;
}
