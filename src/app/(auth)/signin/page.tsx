"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { signInWithEmail } from "@/lib/auth/service";
import { validateEmail } from "@/lib/auth/validation";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { useAuth } from "@/providers/auth-provider";

type Errors = { email?: string; password?: string; form?: string };

export default function SignInPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (status === "authenticated" && user?.emailVerified) router.replace("/dashboard");
    if (status === "authenticated" && user && !user.emailVerified) router.replace("/verify-email");
  }, [router, status, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) nextErrors.email = emailValidation.message;
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const signedInUser = await signInWithEmail(email, password, rememberMe);
      if (!signedInUser.emailVerified) router.replace("/verify-email");
      else router.replace("/dashboard");
    } catch (error) {
      setErrors({ form: getAuthErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to QuoteCompare."
      description="Access your protected procurement workspace with your Firebase account."
      footer={<p>New to QuoteCompare? <Link href="/signup">Create an account</Link></p>}
    >
      {!configured ? <div className="form-notice form-notice--warning" role="alert">Firebase is not configured yet. Add your web app values to <code>.env.local</code> before signing in.</div> : null}
      {errors.form ? <div className="form-notice form-notice--error" role="alert">{errors.form}</div> : null}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormField id="signin-email" label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} placeholder="name@company.com" />
        <FormField id="signin-password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} placeholder="Enter your password" />
        <div className="form-row form-row--between">
          <label className="checkbox-field"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Keep me signed in</span></label>
          <Link className="text-link" href="/forgot-password">Forgot password?</Link>
        </div>
        <button className="button button--accent auth-submit" type="submit" disabled={submitting || !configured}>{submitting ? "Signing in…" : "Sign in securely"}</button>
      </form>
    </AuthShell>
  );
}
