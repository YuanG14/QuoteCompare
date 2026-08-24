import type { Metadata } from "next";
import { QuotationCreate } from "@/components/quotations/quotation-create";

export const metadata: Metadata = { title: "Add quotation" };
export default function NewQuotationPage() {
  return <QuotationCreate />;
}
