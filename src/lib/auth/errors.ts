import { FirebaseError } from "firebase/app";

const friendlyMessages: Record<string, string> = {
  "auth/email-already-in-use": "An account already exists for this email address.",
  "auth/invalid-credential": "The email or password you entered is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/missing-password": "Enter your password to continue.",
  "auth/network-request-failed":
    "We could not reach Firebase. Check your connection and try again.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled for this Firebase project.",
  "auth/too-many-requests": "Too many attempts were made. Please wait a moment and try again.",
  "auth/user-disabled": "This account has been disabled. Contact your workspace administrator.",
  "auth/weak-password":
    "Use a stronger password with at least 8 characters, a number, and mixed case letters.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      friendlyMessages[error.code] ?? "Authentication could not be completed. Please try again."
    );
  }

  if (error instanceof Error && error.message.includes("Firebase is not configured")) {
    return error.message;
  }

  return "Something unexpected happened. Please try again.";
}
