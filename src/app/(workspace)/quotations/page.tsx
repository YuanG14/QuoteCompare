import type { Metadata } from "next";
import { QuotationDirectory } from "@/components/quotations/quotation-directory";

export const metadata: Metadata = { title: "Quotations" };
export default function QuotationsPage() {
  return <QuotationDirectory />;
}
