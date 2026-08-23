import { FirebaseError } from "firebase/app";

export function getPurchaseRequestErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied")
      return "Your organization role does not allow this purchase request change.";
    if (error.code === "not-found") return "This purchase request is no longer available.";
    if (error.code === "unavailable")
      return "Purchase request data is temporarily unavailable. Check your connection and try again.";
  }
  return error instanceof Error
    ? error.message
    : "We couldn't complete the purchase request action.";
}
