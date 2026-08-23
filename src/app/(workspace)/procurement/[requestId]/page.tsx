import type { Metadata } from "next";
import { PurchaseRequestDetail } from "@/components/procurement/purchase-request-detail";

export const metadata: Metadata = { title: "Purchase request" };

export default async function PurchaseRequestPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  return <PurchaseRequestDetail requestId={requestId} />;
}
