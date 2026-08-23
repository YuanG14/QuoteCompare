import type { Metadata } from "next";
import { RfqCreate } from "@/components/rfqs/rfq-create";

export const metadata: Metadata = { title: "Build RFQ" };
export default function NewRfqPage() {
  return <RfqCreate />;
}
