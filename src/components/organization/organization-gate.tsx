"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/providers/organization-provider";

export function OrganizationGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status, error, refresh } = useOrganization();

  useEffect(() => {
    if (status === "missing") router.replace("/organization/setup");
  }, [router, status]);

  if (status === "error") {
    return (
      <main className="state-screen">
        <section className="state-card" role="alert">
          <span className="state-label">Workspace access issue</span>
          <h1>We could not load your organization.</h1>
          <p>{error}</p>
          <div className="state-actions">
            <button className="button button--primary" type="button" onClick={() => void refresh()}>
              Try again
            </button>
            <Link className="button button--secondary" href="/organization/setup">
              Organization setup
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (status !== "ready") {
    return (
      <main className="state-screen" aria-busy="true">
        <section className="state-card">
          <span className="state-label">Secure organization</span>
          <h1>Checking workspace access.</h1>
          <p>
            QuoteCompare is verifying your organization membership and role before loading
            procurement data.
          </p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
