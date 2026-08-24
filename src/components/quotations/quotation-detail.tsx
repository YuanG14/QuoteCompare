"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { QuotationForm } from "@/components/quotations/quotation-form";
import { calculateQuotationTotals, formatQuotationMoney } from "@/lib/quotations/calculations";
import { getQuotationErrorMessage } from "@/lib/quotations/errors";
import { getQuotation, updateQuotation, updateQuotationStatus } from "@/lib/quotations/service";
import { listRfqs } from "@/lib/rfqs/service";
import { useAuth } from "@/providers/auth-provider";
import { useOrganization } from "@/providers/organization-provider";
import type { Quotation, QuotationInput } from "@/types/quotation";
import type { Rfq } from "@/types/rfq";

function inputFor(record: Quotation): QuotationInput {
  return {
    rfqId: record.rfqId,
    rfqNumber: record.rfqNumber,
    rfqTitle: record.rfqTitle,
    supplierId: record.supplierId,
    supplierName: record.supplierName,
    items: record.items,
    discount: record.discount,
    shipping: record.shipping,
    installation: record.installation,
    tax: record.tax,
    warranty: record.warranty,
    deliveryCommitment: record.deliveryCommitment,
    paymentTerms: record.paymentTerms,
    notes: record.notes,
    source: record.source,
  };
}
function timestamp(value: Date | null): string {
  return value
    ? new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(value)
    : "Not recorded";
}

export function QuotationDetail({ quotationId }: { quotationId: string }) {
  const { user } = useAuth();
  const { organization, can } = useOrganization();
  const [record, setRecord] = useState<Quotation | null>(null);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      const [quotation, rfqRecords] = await Promise.all([
        getQuotation(organization.id, quotationId),
        listRfqs(organization.id),
      ]);
      setRecord(quotation);
      setRfqs(rfqRecords);
    } catch (nextError) {
      setError(getQuotationErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [organization, quotationId]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  async function save(input: QuotationInput) {
    if (
      !organization ||
      !user ||
      !record ||
      record.status === "verified" ||
      !can("quotations.manage")
    )
      return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateQuotation(organization.id, record.id, user.uid, input);
      setEditing(false);
      setMessage("Quotation details updated.");
      await load();
    } catch (nextError) {
      setError(getQuotationErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }
  async function changeStatus(nextStatus: "needs_review" | "verified") {
    if (!organization || !user || !record || !can("quotations.manage")) return;
    if (nextStatus === "verified" && !can("rfqs.issue")) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateQuotationStatus(organization.id, record.id, user.uid, nextStatus);
      setMessage(
        nextStatus === "verified"
          ? "Quotation verified and locked for future comparison."
          : "Quotation sent for human review.",
      );
      await load();
    } catch (nextError) {
      setError(getQuotationErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }
  if (loading)
    return (
      <section className="pr-detail-state" aria-busy="true">
        <span className="state-label">Quotation record</span>
        <h1>Loading the supplier offer.</h1>
        <p>Retrieving structured values from this organization.</p>
      </section>
    );
  if (!record)
    return (
      <section className="pr-detail-state">
        <span className="state-label">Quotation unavailable</span>
        <h1>Supplier quotation not found.</h1>
        <p>The record may belong to another organization or the link may be incorrect.</p>
        <Link className="button button--primary" href="/quotations">
          Back to quotations
        </Link>
      </section>
    );
  if (editing)
    return (
      <div className="page-stack quotation-builder-page">
        <Link
          className="text-link"
          href={`/quotations/${record.id}`}
          onClick={(event) => {
            event.preventDefault();
            setEditing(false);
          }}
        >
          ← Back to quotation
        </Link>
        <header className="rfq-builder-header">
          <p className="eyebrow">Edit {record.quotationNumber}</p>
          <h1>Correct the structured supplier response.</h1>
          <p className="page-subtitle">
            RFQ and supplier are fixed. The source file remains local and is never retrieved from
            Firebase.
          </p>
        </header>
        {error ? <div className="form-notice form-notice--error">{error}</div> : null}
        <QuotationForm
          initialValue={inputFor(record)}
          rfqs={rfqs}
          lockAssociation
          saving={saving}
          submitLabel="Save changes"
          onSubmit={save}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  const totals = calculateQuotationTotals(record.items, record);
  return (
    <div className="page-stack quotation-detail-page">
      <Link className="text-link" href="/quotations">
        ← Back to quotations
      </Link>
      {error ? (
        <div className="form-notice form-notice--error" role="alert">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="form-notice form-notice--success" role="status">
          {message}
        </div>
      ) : null}
      <header className="quotation-detail-hero">
        <div>
          <div className="quotation-detail-kicker">
            <span>{record.quotationNumber}</span>
            <span className={`quotation-status quotation-status--${record.status}`}>
              {record.status === "needs_review"
                ? "Needs review"
                : record.status[0].toUpperCase() + record.status.slice(1)}
            </span>
          </div>
          <h1>{record.supplierName}</h1>
          <p>
            Response to{" "}
            <Link href={`/rfqs/${record.rfqId}`}>
              {record.rfqNumber} · {record.rfqTitle}
            </Link>
          </p>
        </div>
        <aside>
          <span>Grand total</span>
          <strong>{formatQuotationMoney(totals.grandTotal)}</strong>
          <small>PHP · structured quotation</small>
        </aside>
      </header>
      <section className="quotation-detail-layout">
        <main className="quotation-detail-content">
          <article className="quotation-detail-card">
            <div className="quotation-card-heading">
              <div>
                <p className="eyebrow">Price schedule</p>
                <h2>Quoted items</h2>
              </div>
              <span>{record.items.length} lines</span>
            </div>
            <div className="quotation-price-table">
              {record.items.map((item, index) => (
                <div key={item.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {item.quantity.toLocaleString("en-PH")} {item.unit} ·{" "}
                      {item.specifications || "No specification note"}
                    </small>
                  </div>
                  <div>
                    <small>Unit price</small>
                    <strong>{formatQuotationMoney(item.unitPrice)}</strong>
                  </div>
                  <div>
                    <small>Line total</small>
                    <strong>{formatQuotationMoney(item.quantity * item.unitPrice)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article className="quotation-detail-card">
            <p className="eyebrow">Cost breakdown</p>
            <h2>Transparent total</h2>
            <dl className="quotation-totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatQuotationMoney(totals.subtotal)}</dd>
              </div>
              <div>
                <dt>Discount</dt>
                <dd>− {formatQuotationMoney(totals.discount)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{formatQuotationMoney(totals.shipping)}</dd>
              </div>
              <div>
                <dt>Installation</dt>
                <dd>{formatQuotationMoney(totals.installation)}</dd>
              </div>
              <div>
                <dt>Tax</dt>
                <dd>{formatQuotationMoney(totals.tax)}</dd>
              </div>
              <div>
                <dt>Grand total</dt>
                <dd>{formatQuotationMoney(totals.grandTotal)}</dd>
              </div>
            </dl>
          </article>
          <article className="quotation-detail-card">
            <p className="eyebrow">Supplier terms</p>
            <h2>Beyond price</h2>
            <dl className="quotation-terms">
              <div>
                <dt>Warranty</dt>
                <dd>{record.warranty}</dd>
              </div>
              <div>
                <dt>Delivery commitment</dt>
                <dd>{record.deliveryCommitment}</dd>
              </div>
              <div>
                <dt>Payment terms</dt>
                <dd>{record.paymentTerms}</dd>
              </div>
              <div>
                <dt>Internal notes</dt>
                <dd>{record.notes || "No internal notes."}</dd>
              </div>
            </dl>
          </article>
        </main>
        <aside className="quotation-action-panel">
          <span className="state-label">Review control</span>
          <h2>
            {record.status === "verified"
              ? "Verified and locked."
              : record.status === "needs_review"
                ? "Ready for a human check."
                : "Draft values can still change."}
          </h2>
          <p>
            {record.status === "verified"
              ? "This structured record is locked so later comparison phases receive stable data."
              : "Check every amount and commercial term against the supplier's local source before changing status."}
          </p>
          <div className="quotation-action-stack">
            {record.status !== "verified" && can("quotations.manage") ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setEditing(true)}
              >
                Edit quotation
              </button>
            ) : null}
            {record.status === "draft" && can("quotations.manage") ? (
              <button
                className="button button--accent"
                type="button"
                onClick={() => void changeStatus("needs_review")}
                disabled={saving}
              >
                Send for review
              </button>
            ) : null}
            {record.status === "needs_review" && can("rfqs.issue") ? (
              <button
                className="button button--accent"
                type="button"
                onClick={() => void changeStatus("verified")}
                disabled={saving}
              >
                Verify quotation
              </button>
            ) : null}
          </div>
          <div className="quotation-source-card">
            <span>Source metadata</span>
            <strong>{record.source.filename || "Manual entry"}</strong>
            <small>{record.source.type.toUpperCase()} · document not stored</small>
            {record.source.checksum ? <code>{record.source.checksum}</code> : null}
          </div>
          <div className="quotation-audit">
            <span>Created {timestamp(record.createdAt)}</span>
            <span>Updated {timestamp(record.updatedAt)}</span>
            <span>Submitted {timestamp(record.submittedAt)}</span>
            <span>Verified {timestamp(record.verifiedAt)}</span>
          </div>
        </aside>
      </section>
    </div>
  );
}
