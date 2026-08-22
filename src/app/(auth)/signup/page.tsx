"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { createAccount } from "@/lib/auth/service";
import { validateDisplayName, validateEmail, validatePassword } from "@/lib/auth/validation";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { useAuth } from "@/providers/auth-provider";

type Errors = { name?: string; email?: string; password?: string; confirmPassword?: string; form?: string };

export default function SignUpPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (status === "authenticated" && user?.emailVerified) router.replace("/dashboard");
  }, [router, status, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};
    const nameValidation = validateDisplayName(name);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    if (!nameValidation.valid) nextErrors.name = nameValidation.message;
    if (!emailValidation.valid) nextErrors.email = emailValidation.message;
    if (!passwordValidation.valid) nextErrors.password = passwordValidation.message;
    if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await createAccount(name, email, password);
      router.replace("/verify-email");
    } catch (error) {
      setErrors({ form: getAuthErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Start with a verified identity."
      description="Phase 2 establishes secure account access before organization and role permissions arrive next."
      footer={<p>Already have an account? <Link href="/signin">Sign in</Link></p>}
    >
      {!configured ? <div className="form-notice form-notice--warning" role="alert">Firebase is not configured yet. Add your web app values to <code>.env.local</code> before creating an account.</div> : null}
      {errors.form ? <div className="form-notice form-notice--error" role="alert">{errors.form}</div> : null}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField id="signup-name" label="Full name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} placeholder="Your full name" />
        <FormField id="signup-email" label="Work email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} placeholder="name@company.com" />
        <FormField id="signup-password" label="Password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} hint="At least 8 characters with uppercase, lowercase, and a number." placeholder="Create a strong password" />
        <FormField id="signup-confirm-password" label="Confirm password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={errors.confirmPassword} placeholder="Repeat your password" />
        <button className="button button--accent auth-submit" type="submit" disabled={submitting || !configured}>{submitting ? "Creating account…" : "Create secure account"}</button>
      </form>
    </AuthShell>
  );
}
