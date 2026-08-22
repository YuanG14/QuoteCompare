import { FirebaseError } from "firebase/app";

export function getSupplierErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied") return "Your role does not allow this supplier change.";
    if (error.code === "unavailable")
      return "Supplier data is temporarily unavailable. Check your connection and try again.";
  }
  return error instanceof Error ? error.message : "We couldn't complete the supplier request.";
}
