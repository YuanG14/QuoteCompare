import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/layout/brand";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="auth-page">
      <header className="auth-header">
        <Brand href="/" />
        <Link className="auth-back-link" href="/">
          Back to overview
        </Link>
      </header>

      <div className="auth-layout">
        <section className="auth-story" aria-label="QuoteCompare authentication introduction">
          <div>
            <p className="eyebrow eyebrow--on-dark">Secure procurement workspace</p>
            <h1>Keep every decision tied to the right person.</h1>
          </div>
          <div className="auth-story__footer">
            <span className="auth-story__index">QC / AUTH</span>
            <p>
              Authentication comes before supplier data, quotation files, approvals, and audit
              history.
            </p>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card__heading">
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          {children}
          <div className="auth-card__footer">{footer}</div>
        </section>
      </div>
    </main>
  );
}
