import type { Metadata } from "next";
import { RfqDirectory } from "@/components/rfqs/rfq-directory";

export const metadata: Metadata = { title: "RFQs" };
export default function RfqsPage() {
  return <RfqDirectory />;
}
