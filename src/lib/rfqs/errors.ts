import { FirebaseError } from "firebase/app";

export function getRfqErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied")
      return "Firebase blocked this RFQ action. Confirm your organization role, purchase request status, and deployed rules.";
    if (error.code === "not-found") return "This RFQ is no longer available.";
    if (error.code === "unavailable")
      return "RFQ data is temporarily unavailable. Check your connection and try again.";
  }
  return error instanceof Error ? error.message : "We couldn't complete the RFQ action.";
}
