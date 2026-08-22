"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { requestPasswordReset } from "@/lib/auth/service";
import { validateEmail } from "@/lib/auth/validation";
import { isFirebaseConfigured } from "@/lib/firebase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const configured = isFirebaseConfigured();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setMessage("If an account is eligible for password reset, Firebase will send instructions to that email address.");
    } catch (resetError) {
      setError(getAuthErrorMessage(resetError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password."
      description="Enter the email connected to your QuoteCompare account."
      footer={<p>Remember your password? <Link href="/signin">Return to sign in</Link></p>}
    >
      {message ? <div className="form-notice form-notice--success" role="status">{message}</div> : null}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField id="reset-email" label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={error ?? undefined} placeholder="name@company.com" />
        <button className="button button--accent auth-submit" type="submit" disabled={submitting || !configured}>{submitting ? "Sending…" : "Send reset instructions"}</button>
      </form>
    </AuthShell>
  );
}
