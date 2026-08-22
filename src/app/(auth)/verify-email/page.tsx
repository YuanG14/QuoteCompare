"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { resendVerification, signOutCurrentUser } from "@/lib/auth/service";
import { useAuth } from "@/providers/auth-provider";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/signin");
    if (status === "authenticated" && user?.emailVerified) router.replace("/dashboard");
  }, [router, status, user]);

  async function checkVerification() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await user.reload();
      if (user.emailVerified) router.replace("/dashboard");
      else
        setMessage(
          "Your email is not verified yet. Open the Firebase email, verify it, then check again.",
        );
    } catch (reloadError) {
      setError(getAuthErrorMessage(reloadError));
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await resendVerification(user);
      setMessage("Verification email sent. Check your inbox and spam folder.");
    } catch (resendError) {
      setError(getAuthErrorMessage(resendError));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await signOutCurrentUser();
    router.replace("/signin");
  }

  return (
    <AuthShell
      eyebrow="Verify your email"
      title="Confirm this account belongs to you."
      description={`We sent a verification message to ${user?.email ?? "your email address"}.`}
      footer={
        <p>
          Wrong account?{" "}
          <button className="inline-button" type="button" onClick={handleSignOut}>
            Sign out
          </button>
        </p>
      }
    >
      {message ? (
        <div className="form-notice form-notice--success" role="status">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="form-notice form-notice--error" role="alert">
          {error}
        </div>
      ) : null}
      <div className="verification-actions">
        <button
          className="button button--accent auth-submit"
          type="button"
          onClick={checkVerification}
          disabled={busy || !user}
        >
          {busy ? "Checking…" : "I verified my email"}
        </button>
        <button
          className="button button--secondary auth-submit"
          type="button"
          onClick={handleResend}
          disabled={busy || !user}
        >
          Resend verification email
        </button>
      </div>
      <p className="verification-note">
        Firebase may throttle repeated verification emails. If you just requested one, wait before
        trying again.
      </p>
      <Link className="text-link" href="/">
        Why verification is required
      </Link>
    </AuthShell>
  );
}
