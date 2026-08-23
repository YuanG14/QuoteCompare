"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { RfqForm } from "@/components/rfqs/rfq-form";
import { Icon } from "@/components/ui/icons";
import { listPurchaseRequests } from "@/lib/purchase-requests/service";
import { calculateRfqSummary } from "@/lib/rfqs/calculations";
import { getRfqErrorMessage } from "@/lib/rfqs/errors";
import { getRfq, updateRfq, updateRfqStatus } from "@/lib/rfqs/service";
import { hasRfqErrors, validateRfq } from "@/lib/rfqs/validation";
import { listSuppliers } from "@/lib/suppliers/service";
import { useAuth } from "@/providers/auth-provider";
import { useOrganization } from "@/providers/organization-provider";
import type { PurchaseRequest } from "@/types/purchase-request";
import type { Rfq, RfqInput } from "@/types/rfq";
import type { Supplier } from "@/types/supplier";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
function formatTimestamp(value: Date | null): string {
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

export function RfqDetail({ rfqId }: { rfqId: string }) {
  const { user } = useAuth();
  const { organization, can } = useOrganization();
  const [rfq, setRfq] = useState<Rfq | null>(null);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
      const [record, requests, supplierRecords] = await Promise.all([
        getRfq(organization.id, rfqId),
        listPurchaseRequests(organization.id),
        listSuppliers(organization.id),
      ]);
      setRfq(record);
      setPurchaseRequests(requests);
      setSuppliers(
        supplierRecords.filter(
          (supplier) =>
            supplier.status === "active" ||
            record?.selectedSuppliers.some((selected) => selected.id === supplier.id),
        ),
      );
    } catch (nextError) {
      setError(getRfqErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [organization, rfqId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(input: RfqInput) {
    if (!organization || !user || !rfq || rfq.status !== "draft" || !can("quotations.manage"))
      return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateRfq(organization.id, rfq.id, user.uid, input);
      setEditing(false);
      setMessage("RFQ draft updated.");
      await load();
    } catch (nextError) {
      setError(getRfqErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(status: "issued" | "closed") {
    if (!organization || !user || !rfq || !can("rfqs.issue")) return;
    if (status === "issued") {
      const input: RfqInput = {
        purchaseRequestId: rfq.purchaseRequestId,
        purchaseRequestNumber: rfq.purchaseRequestNumber,
        purchaseRequestTitle: rfq.purchaseRequestTitle,
        title: rfq.title,
        items: rfq.items,
        criteria: rfq.criteria,
        quotationDeadline: rfq.quotationDeadline,
        deliveryDestination: rfq.deliveryDestination,
        paymentExpectations: rfq.paymentExpectations,
        evaluationCriteria: rfq.evaluationCriteria,
        selectedSuppliers: rfq.selectedSuppliers,
      };
      const source = purchaseRequests.find((request) => request.id === rfq.purchaseRequestId);
      if (!source || source.status !== "open" || source.archived) {
        setError("Reopen the source purchase request before issuing this RFQ.");
        return;
      }
      const validation = validateRfq(input, source?.requiredDate);
      if (hasRfqErrors(validation)) {
        setError(
          "Review the RFQ draft before issuance. Its deadline, source request, items, criteria, commercial terms, or supplier shortlist is no longer valid.",
        );
        return;
      }
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateRfqStatus(organization.id, rfq.id, user.uid, status);
      setMessage(
        status === "issued"
          ? "RFQ issued. The content is now locked for quotation intake."
          : "RFQ closed.",
      );
      await load();
    } catch (nextError) {
      setError(getRfqErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <section className="pr-detail-state" aria-busy="true">
        <span className="state-label">RFQ workspace</span>
        <h1>Loading the supplier brief.</h1>
        <p>Retrieving the organization-scoped RFQ, source request, and supplier records.</p>
      </section>
    );
  if (!rfq)
    return (
      <section className="pr-detail-state">
        <span className="state-label">RFQ unavailable</span>
        <h1>Request for quotation not found.</h1>
        <p>The record may not exist in this organization or the link may be incorrect.</p>
        <Link className="button button--primary" href="/rfqs">
          Back to RFQs
        </Link>
      </section>
    );

  const input: RfqInput = {
    purchaseRequestId: rfq.purchaseRequestId,
    purchaseRequestNumber: rfq.purchaseRequestNumber,
    purchaseRequestTitle: rfq.purchaseRequestTitle,
    title: rfq.title,
    items: rfq.items,
    criteria: rfq.criteria,
    quotationDeadline: rfq.quotationDeadline,
    deliveryDestination: rfq.deliveryDestination,
    paymentExpectations: rfq.paymentExpectations,
    evaluationCriteria: rfq.evaluationCriteria,
    selectedSuppliers: rfq.selectedSuppliers,
  };
  const summary = calculateRfqSummary(rfq.items, rfq.criteria, rfq.selectedSuppliers);
  const source = purchaseRequests.find((request) => request.id === rfq.purchaseRequestId);
  const sourceOpen = Boolean(source && source.status === "open" && !source.archived);

  if (editing)
    return (
      <div className="page-stack rfq-builder-page">
        <button
          className="text-link rfq-back-button"
          type="button"
          onClick={() => setEditing(false)}
        >
          ← Back to RFQ
        </button>
        <header className="rfq-builder-header">
          <p className="eyebrow">Edit draft · {rfq.rfqNumber}</p>
          <h1>Refine the supplier brief.</h1>
          <p className="page-subtitle">
            The linked purchase request remains unchanged while this draft is edited.
          </p>
        </header>
        {error ? <div className="form-notice form-notice--error">{error}</div> : null}
        <RfqForm
          key={`${rfq.id}-${rfq.updatedAt?.getTime()}`}
          initialValue={input}
          purchaseRequests={purchaseRequests}
          suppliers={suppliers}
          lockPurchaseRequest
          saving={saving}
          submitLabel="Save RFQ changes"
          onSubmit={save}
          onCancel={() => setEditing(false)}
        />
      </div>
    );

  return (
    <div className="page-stack rfq-detail-page">
      <Link className="text-link" href="/rfqs">
        ← Back to RFQs
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
      <header className="rfq-detail-hero">
        <div>
          <div className="rfq-detail-kicker">
            <span>{rfq.rfqNumber}</span>
            <span className={`rfq-status rfq-status--${rfq.status}`}>
              {rfq.status[0].toUpperCase() + rfq.status.slice(1)}
            </span>
          </div>
          <h1>{rfq.title}</h1>
          <p>
            Based on{" "}
            <Link href={`/procurement/${rfq.purchaseRequestId}`}>
              {rfq.purchaseRequestNumber} · {rfq.purchaseRequestTitle}
            </Link>
          </p>
        </div>
        <aside>
          <span>Quotation deadline</span>
          <strong>{formatDate(rfq.quotationDeadline)}</strong>
          <small>Updated {formatTimestamp(rfq.updatedAt)}</small>
        </aside>
      </header>
      <section className="rfq-detail-metrics">
        <article>
          <span>Item lines</span>
          <strong>{summary.itemLines}</strong>
        </article>
        <article>
          <span>Required criteria</span>
          <strong>{summary.requiredCriteria}</strong>
        </article>
        <article>
          <span>Preferred criteria</span>
          <strong>{summary.preferredCriteria}</strong>
        </article>
        <article>
          <span>Invited suppliers</span>
          <strong>{summary.invitedSuppliers}</strong>
        </article>
        <aside>
          <span>Lifecycle</span>
          <strong>
            {rfq.status === "draft"
              ? "Editable supplier brief"
              : rfq.status === "issued"
                ? "Locked for quotation intake"
                : "RFQ responses closed"}
          </strong>
        </aside>
      </section>
      <section className="rfq-detail-layout">
        <main className="rfq-detail-content">
          <article className="rfq-detail-card">
            <div className="pr-section-heading">
              <div>
                <p className="eyebrow">Requested scope</p>
                <h2>Items suppliers must price.</h2>
              </div>
              <span>{summary.totalQuantity.toLocaleString("en-PH")} total units</span>
            </div>
            <div className="pr-detail-items">
              {rfq.items.map((item, index) => (
                <div className="pr-detail-item" key={item.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.specifications || "No additional specifications."}</p>
                  </div>
                  <aside>
                    <strong>{item.quantity.toLocaleString("en-PH")}</strong>
                    <small>{item.unit}</small>
                  </aside>
                </div>
              ))}
            </div>
          </article>
          <article className="rfq-detail-card">
            <p className="eyebrow">Requirements</p>
            <h2>Required and preferred criteria.</h2>
            <div className="rfq-detail-criteria">
              {rfq.criteria.map((criterion) => (
                <div key={criterion.id}>
                  <span className={`rfq-importance rfq-importance--${criterion.importance}`}>
                    {criterion.importance}
                  </span>
                  <div>
                    <strong>{criterion.label}</strong>
                    <p>{criterion.description || "No additional clarification."}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article className="rfq-detail-card">
            <p className="eyebrow">Commercial expectations</p>
            <h2>Terms suppliers should address.</h2>
            <dl className="rfq-terms">
              <div>
                <dt>Delivery destination</dt>
                <dd>{rfq.deliveryDestination}</dd>
              </div>
              <div>
                <dt>Payment expectations</dt>
                <dd>{rfq.paymentExpectations}</dd>
              </div>
              <div>
                <dt>Evaluation approach</dt>
                <dd>{rfq.evaluationCriteria}</dd>
              </div>
            </dl>
          </article>
          <article className="rfq-detail-card">
            <p className="eyebrow">Supplier shortlist</p>
            <h2>Organizations invited to quote.</h2>
            <div className="rfq-invite-list">
              {rfq.selectedSuppliers.map((supplier, index) => (
                <div key={supplier.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{supplier.name}</strong>
                </div>
              ))}
            </div>
          </article>
        </main>
        <aside className="rfq-action-panel">
          <span className="pr-action-panel__index">QC / RFQ ACTIONS</span>
          <h2>
            {rfq.status === "draft"
              ? "Review before issuance."
              : rfq.status === "issued"
                ? "Ready for quotation intake."
                : "This RFQ is closed."}
          </h2>
          <p>
            {rfq.status === "draft"
              ? "Draft content remains editable. Issuance locks the supplier brief so every quotation is evaluated against the same scope."
              : rfq.status === "issued"
                ? "Phase 7 will record supplier quotations against this locked request."
                : "The supplier brief and lifecycle timestamps remain available for history."}
          </p>
          <div className="pr-action-stack">
            {rfq.status === "draft" && sourceOpen && can("quotations.manage") ? (
              <button
                className="button button--accent"
                type="button"
                onClick={() => setEditing(true)}
              >
                Edit RFQ draft
              </button>
            ) : null}
            {rfq.status === "draft" && can("rfqs.issue") ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void changeStatus("issued")}
                disabled={saving}
              >
                Issue to suppliers
              </button>
            ) : null}
            {rfq.status === "issued" && can("rfqs.issue") ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void changeStatus("closed")}
                disabled={saving}
              >
                Close RFQ
              </button>
            ) : null}
          </div>
          <div className="rfq-lifecycle-dates">
            <span>Created {formatTimestamp(rfq.createdAt)}</span>
            <span>Issued {formatTimestamp(rfq.issuedAt)}</span>
            <span>Closed {formatTimestamp(rfq.closedAt)}</span>
          </div>
          {rfq.status === "draft" && source?.status !== "open" ? (
            <small className="pr-action-note">
              <Icon name="shield" width={15} height={15} />
              The source purchase request is no longer Open. Reopen it before editing or issuing
              this RFQ.
            </small>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
