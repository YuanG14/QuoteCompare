import { FirebaseError } from "firebase/app";

export function getQuotationErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied")
      return "Firebase blocked this quotation action. Confirm the RFQ status, organization role, supplier, and deployed rules.";
    if (error.code === "already-exists")
      return "A quotation for this supplier and RFQ already exists.";
    if (error.code === "unavailable")
      return "Quotation data is temporarily unavailable. Check your connection and try again.";
  }
  return error instanceof Error ? error.message : "We couldn't complete the quotation action.";
}
