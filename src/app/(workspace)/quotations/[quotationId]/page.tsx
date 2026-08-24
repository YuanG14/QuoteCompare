import type { Metadata } from "next";
import { QuotationDetail } from "@/components/quotations/quotation-detail";

export const metadata: Metadata = { title: "Quotation" };
export default async function QuotationPage({
  params,
}: {
  params: Promise<{ quotationId: string }>;
}) {
  const { quotationId } = await params;
  return <QuotationDetail quotationId={quotationId} />;
}
