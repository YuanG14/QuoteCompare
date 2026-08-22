"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export function ProtectedWorkspace({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
    if (status === "authenticated" && user && !user.emailVerified) {
      router.replace("/verify-email");
    }
  }, [router, status, user]);

  if (status === "configuration-missing") {
    return (
      <main className="state-screen">
        <section className="state-card" role="alert">
          <span className="state-label">Firebase setup required</span>
          <h1>Connect your Firebase project.</h1>
          <p>
            Copy <code>.env.example</code> to <code>.env.local</code>, add your Firebase web app
            values, then restart the development server.
          </p>
          <Link className="button button--primary" href="/">
            View setup overview
          </Link>
        </section>
      </main>
    );
  }

  if (status === "loading" || status === "unauthenticated" || (user && !user.emailVerified)) {
    return (
      <main className="state-screen" aria-busy="true">
        <section className="state-card">
          <span className="state-label">Secure workspace</span>
          <h1>Checking your session.</h1>
          <p>Please wait while QuoteCompare verifies your Firebase authentication state.</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
