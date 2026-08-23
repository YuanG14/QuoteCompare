import type { Metadata } from "next";
import { RfqDetail } from "@/components/rfqs/rfq-detail";

export const metadata: Metadata = { title: "RFQ" };
export default async function RfqPage({ params }: { params: Promise<{ rfqId: string }> }) {
  const { rfqId } = await params;
  return <RfqDetail rfqId={rfqId} />;
}
