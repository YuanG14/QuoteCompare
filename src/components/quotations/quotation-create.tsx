"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { emptyQuotationInput, QuotationForm } from "@/components/quotations/quotation-form";
import { getQuotationErrorMessage } from "@/lib/quotations/errors";
import { createQuotation } from "@/lib/quotations/service";
import { listRfqs } from "@/lib/rfqs/service";
import { useAuth } from "@/providers/auth-provider";
import { useOrganization } from "@/providers/organization-provider";
import type { QuotationInput } from "@/types/quotation";
import type { Rfq } from "@/types/rfq";

export function QuotationCreate() {
  const router = useRouter();
  const { user } = useAuth();
  const { organization, can } = useOrganization();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!organization) return;
    let active = true;
    const timer = window.setTimeout(
      () =>
        void listRfqs(organization.id)
          .then((records) => {
            if (active) setRfqs(records.filter((rfq) => rfq.status === "issued"));
          })
          .catch((nextError) => {
            if (active) setError(getQuotationErrorMessage(nextError));
          })
          .finally(() => {
            if (active) setLoading(false);
          }),
      0,
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [organization]);
  async function create(input: QuotationInput) {
    if (!organization || !user || !can("quotations.manage")) return;
    setSaving(true);
    setError(null);
    try {
      const id = await createQuotation(organization.id, user.uid, input);
      router.push(`/quotations/${id}`);
    } catch (nextError) {
      setError(getQuotationErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }
  if (!can("quotations.manage"))
    return (
      <section className="pr-detail-state">
        <span className="state-label">Quotation access</span>
        <h1>Your role cannot enter quotations.</h1>
        <p>You can still read quotation records available to your organization.</p>
        <Link className="button button--primary" href="/quotations">
          Back to quotations
        </Link>
      </section>
    );
  if (loading)
    return (
      <section className="pr-detail-state" aria-busy="true">
        <span className="state-label">Quotation intake</span>
        <h1>Preparing issued RFQs.</h1>
        <p>Loading organization-scoped supplier invitations and requested items.</p>
      </section>
    );
  return (
    <div className="page-stack quotation-builder-page">
      <Link className="text-link" href="/quotations">
        ← Back to quotations
      </Link>
      <header className="rfq-builder-header">
        <p className="eyebrow">New supplier quotation</p>
        <h1>Translate one supplier offer into comparable data.</h1>
        <p className="page-subtitle">
          The local document stays in this browser. Firestore receives structured values, its
          filename, source type, and optional SHA-256 checksum only.
        </p>
      </header>
      {error ? (
        <div className="form-notice form-notice--error" role="alert">
          {error}
        </div>
      ) : null}
      {rfqs.length === 0 ? (
        <div className="form-notice form-notice--warning">
          No Issued RFQs are ready for quotation intake. Issue an RFQ before recording a supplier
          response.
        </div>
      ) : null}
      <QuotationForm
        initialValue={emptyQuotationInput()}
        rfqs={rfqs}
        saving={saving}
        submitLabel="Save quotation draft"
        onSubmit={create}
        onCancel={() => router.push("/quotations")}
      />
    </div>
  );
}
