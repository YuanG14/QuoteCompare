"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PurchaseRequestForm } from "@/components/procurement/purchase-request-form";
import { Icon } from "@/components/ui/icons";
import { calculatePurchaseRequestSummary, formatPeso } from "@/lib/purchase-requests/calculations";
import { getPurchaseRequestErrorMessage } from "@/lib/purchase-requests/errors";
import {
  getPurchaseRequest,
  setPurchaseRequestArchived,
  updatePurchaseRequest,
  updatePurchaseRequestStatus,
} from "@/lib/purchase-requests/service";
import { useAuth } from "@/providers/auth-provider";
import { useOrganization } from "@/providers/organization-provider";
import type {
  PurchaseRequest,
  PurchaseRequestInput,
  PurchaseRequestStatus,
} from "@/types/purchase-request";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatUpdatedDate(value: Date | null): string {
  return value
    ? new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(value)
    : "Just now";
}

export function PurchaseRequestDetail({ requestId }: { requestId: string }) {
  const { user } = useAuth();
  const { organization, can } = useOrganization();
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
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
      setRequest(await getPurchaseRequest(organization.id, requestId));
    } catch (nextError) {
      setError(getPurchaseRequestErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [organization, requestId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const canClose = can("procurement.close");
  const canEdit = Boolean(
    request &&
    can("procurement.create") &&
    !request.archived &&
    (request.status !== "closed" || canClose),
  );
  const canArchive = Boolean(
    request && can("procurement.create") && (request.status !== "closed" || canClose),
  );

  async function handleSave(input: PurchaseRequestInput) {
    if (!organization || !user || !request || !canEdit) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updatePurchaseRequest(organization.id, request.id, user.uid, input);
      setEditing(false);
      setMessage("Purchase request updated.");
      await load();
    } catch (nextError) {
      setError(getPurchaseRequestErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(status: PurchaseRequestStatus) {
    if (!organization || !user || !request) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updatePurchaseRequestStatus(organization.id, request.id, user.uid, status);
      setMessage(`Request status changed to ${status}.`);
      await load();
    } catch (nextError) {
      setError(getPurchaseRequestErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchived() {
    if (!organization || !user || !request || !canArchive) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await setPurchaseRequestArchived(organization.id, request.id, user.uid, !request.archived);
      setMessage(request.archived ? "Purchase request restored." : "Purchase request archived.");
      await load();
    } catch (nextError) {
      setError(getPurchaseRequestErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <section className="pr-detail-state" aria-busy="true">
        <span className="state-label">Purchase request</span>
        <h1>Loading request.</h1>
        <p>Retrieving the organization-scoped record from Firestore.</p>
      </section>
    );
  if (!request)
    return (
      <section className="pr-detail-state">
        <span className="state-label">Request unavailable</span>
        <h1>Purchase request not found.</h1>
        <p>It may have been removed from this organization or the link may be incorrect.</p>
        <Link className="button button--primary" href="/procurement">
          Back to purchase requests
        </Link>
      </section>
    );

  const summary = calculatePurchaseRequestSummary(request.items);
  const formValue: PurchaseRequestInput = {
    title: request.title,
    requesterName: request.requesterName,
    department: request.department,
    purpose: request.purpose,
    budget: request.budget,
    requiredDate: request.requiredDate,
    items: request.items,
    notes: request.notes,
    status: request.status,
  };

  if (editing)
    return (
      <div className="page-stack pr-edit-page">
        <div className="pr-detail-back">
          <button className="text-link" type="button" onClick={() => setEditing(false)}>
            ← Back to request
          </button>
        </div>
        <header className="pr-edit-header">
          <p className="eyebrow">Edit · {request.requestNumber}</p>
          <h1>Refine the internal request.</h1>
          <p className="page-subtitle">
            Update the details without changing the request identity or organization history.
          </p>
        </header>
        <PurchaseRequestForm
          key={`${request.id}-${request.updatedAt?.getTime()}`}
          initialValue={formValue}
          allowClosedStatus={canClose}
          saving={saving}
          submitLabel="Save request changes"
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
        />
      </div>
    );

  return (
    <div className="page-stack pr-detail-page">
      <Link className="text-link pr-detail-back" href="/procurement">
        ← Back to purchase requests
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
      <header className="pr-detail-hero">
        <div>
          <div className="pr-detail-kicker">
            <span>{request.requestNumber}</span>
            <span
              className={`pr-status pr-status--${request.archived ? "archived" : request.status}`}
            >
              {request.archived
                ? "Archived"
                : request.status[0].toUpperCase() + request.status.slice(1)}
            </span>
          </div>
          <h1>{request.title}</h1>
          <p>
            Requested by {request.requesterName} for {request.department}
          </p>
        </div>
        <aside>
          <span>Required by</span>
          <strong>{formatDate(request.requiredDate)}</strong>
          <small>Updated {formatUpdatedDate(request.updatedAt)}</small>
        </aside>
      </header>

      <section className="pr-detail-metrics">
        <article>
          <span>Estimated budget</span>
          <strong>{formatPeso(request.budget)}</strong>
        </article>
        <article>
          <span>Item lines</span>
          <strong>{summary.lineCount}</strong>
        </article>
        <article>
          <span>Total quantity</span>
          <strong>{summary.totalQuantity.toLocaleString("en-PH")}</strong>
        </article>
        <aside>
          <span>Workflow</span>
          <strong>
            {request.status === "draft"
              ? "Still being prepared"
              : request.status === "open"
                ? "Ready for RFQ preparation"
                : "Procurement work completed"}
          </strong>
        </aside>
      </section>

      <section className="pr-detail-layout">
        <main className="pr-detail-content">
          <article className="pr-detail-section">
            <p className="eyebrow">Purpose</p>
            <h2>Why this purchase is needed.</h2>
            <p className="pr-purpose-copy">{request.purpose}</p>
          </article>
          <article className="pr-detail-section">
            <div className="pr-section-heading">
              <div>
                <p className="eyebrow">Requested scope</p>
                <h2>Items and specifications</h2>
              </div>
              <span>
                {summary.lineCount} {summary.lineCount === 1 ? "line" : "lines"}
              </span>
            </div>
            <div className="pr-detail-items">
              {request.items.map((item, index) => (
                <div className="pr-detail-item" key={item.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.specifications || "No additional specifications recorded."}</p>
                  </div>
                  <aside>
                    <strong>{item.quantity.toLocaleString("en-PH")}</strong>
                    <small>{item.unit}</small>
                  </aside>
                </div>
              ))}
            </div>
          </article>
          {request.notes ? (
            <article className="pr-detail-section">
              <p className="eyebrow">Internal notes</p>
              <h2>Context for the procurement team.</h2>
              <p className="pr-purpose-copy">{request.notes}</p>
            </article>
          ) : null}
        </main>

        <aside className="pr-action-panel">
          <span className="pr-action-panel__index">QC / ACTIONS</span>
          <h2>Move the request forward.</h2>
          <p>
            Actions shown here follow your organization role. Firestore rules enforce the same
            boundary.
          </p>
          <div className="pr-action-stack">
            {canEdit ? (
              <button
                className="button button--accent"
                type="button"
                onClick={() => setEditing(true)}
                disabled={saving}
              >
                Edit request
              </button>
            ) : null}
            {can("procurement.create") && !request.archived && request.status === "draft" ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void changeStatus("open")}
                disabled={saving}
              >
                Mark as open
              </button>
            ) : null}
            {canClose && !request.archived && request.status !== "closed" ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void changeStatus("closed")}
                disabled={saving}
              >
                Close request
              </button>
            ) : null}
            {canClose && !request.archived && request.status === "closed" ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void changeStatus("open")}
                disabled={saving}
              >
                Reopen request
              </button>
            ) : null}
            {canArchive ? (
              <button
                className="pr-archive-button"
                type="button"
                onClick={() => void toggleArchived()}
                disabled={saving}
              >
                {request.archived ? "Restore from archive" : "Archive request"}
              </button>
            ) : null}
          </div>
          {!canEdit ? (
            <small className="pr-action-note">
              <Icon name="shield" width={15} height={15} />
              {request.archived
                ? "Restore this request before editing it."
                : request.status === "closed"
                  ? "Only Managers and Admins can change a closed request."
                  : "Your role has view-only access."}
            </small>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
