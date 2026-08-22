import { FirebaseError } from "firebase/app";

export function getOrganizationErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied") {
      return "Firebase blocked this action. Check that the current Firestore rules are deployed and that your account has the required organization role.";
    }
    if (error.code === "unavailable") {
      return "Firebase is temporarily unavailable. Check your connection and try again.";
    }
    if (error.code === "failed-precondition") {
      return "Firestore is not ready for this request. Confirm that a Firestore database exists in your Firebase project.";
    }
  }

  if (error instanceof Error && error.message.trim()) return error.message;
  return "Something went wrong while updating the organization workspace.";
}
