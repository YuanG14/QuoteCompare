"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PurchaseRequestForm,
  emptyPurchaseRequestInput,
} from "@/components/procurement/purchase-request-form";
import { Icon } from "@/components/ui/icons";
import { calculatePurchaseRequestSummary, formatPeso } from "@/lib/purchase-requests/calculations";
import { getPurchaseRequestErrorMessage } from "@/lib/purchase-requests/errors";
import { createPurchaseRequest, listPurchaseRequests } from "@/lib/purchase-requests/service";
import { useAuth } from "@/providers/auth-provider";
import { useOrganization } from "@/providers/organization-provider";
import type {
  PurchaseRequest,
  PurchaseRequestInput,
  PurchaseRequestStatus,
} from "@/types/purchase-request";

type RequestFilter = "all" | PurchaseRequestStatus | "archived";

function formatDate(value: string): string {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function PurchaseRequestDirectory() {
  const router = useRouter();
  const { user } = useAuth();
  const { organization, can } = useOrganization();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RequestFilter>("all");
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      setRequests(await listPurchaseRequests(organization.id));
    } catch (nextError) {
      setError(getPurchaseRequestErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!creatorOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setCreatorOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [creatorOpen, saving]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesFilter =
        filter === "archived"
          ? request.archived
          : !request.archived && (filter === "all" || request.status === filter);
      const matchesSearch =
        !needle ||
        [
          request.requestNumber,
          request.title,
          request.requesterName,
          request.department,
          request.purpose,
        ].some((value) => value.toLowerCase().includes(needle));
      return matchesFilter && matchesSearch;
    });
  }, [filter, requests, search]);

  const currentRequests = requests.filter((request) => !request.archived);
  const openCount = currentRequests.filter((request) => request.status === "open").length;
  const draftCount = currentRequests.filter((request) => request.status === "draft").length;
  const plannedBudget = currentRequests
    .filter((request) => request.status !== "closed")
    .reduce((total, request) => total + request.budget, 0);

  async function handleCreate(input: PurchaseRequestInput) {
    if (!organization || !user || !can("procurement.create")) return;
    setSaving(true);
    setError(null);
    try {
      const requestId = await createPurchaseRequest(organization.id, user.uid, input);
      setCreatorOpen(false);
      router.push(`/procurement/${requestId}`);
    } catch (nextError) {
      setError(getPurchaseRequestErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }

  if (!organization) return null;

  return (
    <div className="page-stack procurement-page">
      <header className="procurement-header">
        <div>
          <p className="eyebrow">Purchase requests · Phase 5</p>
          <h1>Start with a clear internal need.</h1>
          <p className="page-subtitle">
            Capture the purpose, budget, timing, and exact items before supplier outreach begins.
            Every request remains inside {organization.name}.
          </p>
        </div>
        {can("procurement.create") ? (
          <button
            className="button button--accent"
            type="button"
            onClick={() => {
              setError(null);
              setCreatorOpen(true);
            }}
          >
            <Icon name="plus" width={18} height={18} />
            New purchase request
          </button>
        ) : (
          <span className="read-only-note">
            <Icon name="shield" width={16} height={16} />
            View-only access
          </span>
        )}
      </header>

      {error ? (
        <div className="form-notice form-notice--error" role="alert">
          {error}
        </div>
      ) : null}

      <section className="procurement-summary" aria-label="Purchase request summary">
        <article>
          <span>Open requests</span>
          <strong>{openCount}</strong>
          <small>ready for procurement</small>
        </article>
        <article>
          <span>Drafts</span>
          <strong>{draftCount}</strong>
          <small>still being prepared</small>
        </article>
        <article className="procurement-summary__budget">
          <span>Planned budget</span>
          <strong>{formatPeso(plannedBudget)}</strong>
          <small>across current requests</small>
        </article>
        <aside>
          <span>QC / REQUESTS</span>
          <p>Clear requirements reduce avoidable supplier clarifications.</p>
        </aside>
      </section>

      <section className="pr-directory" aria-labelledby="purchase-request-directory-title">
        <div className="pr-directory__heading">
          <div>
            <p className="eyebrow">Request register</p>
            <h2 id="purchase-request-directory-title">Purchase requests</h2>
          </div>
          <span>
            {loading ? "Loading requests…" : `${visible.length} of ${requests.length} shown`}
          </span>
        </div>
        <div className="pr-toolbar">
          <label className="supplier-search">
            <Icon name="search" width={18} height={18} />
            <span className="sr-only">Search purchase requests</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search request number, title, requester, or department"
            />
          </label>
          <div className="pr-filter-tabs" role="group" aria-label="Filter purchase requests">
            {(["all", "draft", "open", "closed", "archived"] as RequestFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                className={filter === value ? "pr-filter-tab--active" : ""}
                onClick={() => setFilter(value)}
              >
                {value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="supplier-loading" aria-busy="true">
            {[1, 2, 3].map((item) => (
              <span key={item} className="supplier-loading__row" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="supplier-empty pr-empty">
            <span className="supplier-empty__index">00 / NO REQUESTS</span>
            <h3>
              {requests.length === 0
                ? "Document the need before requesting quotes."
                : "No requests match this view."}
            </h3>
            <p>
              {requests.length === 0
                ? "Create the internal request that will later become a structured RFQ. Add the budget, deadline, quantities, and specifications your suppliers will need."
                : "Clear the search or select another status to see other purchase requests."}
            </p>
            {requests.length === 0 && can("procurement.create") ? (
              <button className="text-link" type="button" onClick={() => setCreatorOpen(true)}>
                Create the first request <Icon name="arrow" width={16} height={16} />
              </button>
            ) : null}
          </div>
        ) : (
          <div className="pr-register">
            {visible.map((request) => {
              const summary = calculatePurchaseRequestSummary(request.items);
              return (
                <Link
                  href={`/procurement/${request.id}`}
                  className="pr-register-row"
                  key={request.id}
                >
                  <div className="pr-register-row__number">
                    <span>{request.requestNumber}</span>
                    <small>{request.department}</small>
                  </div>
                  <div className="pr-register-row__title">
                    <strong>{request.title}</strong>
                    <small>Requested by {request.requesterName}</small>
                  </div>
                  <div className="pr-register-row__items">
                    <strong>{summary.lineCount}</strong>
                    <small>{summary.lineCount === 1 ? "item line" : "item lines"}</small>
                  </div>
                  <div className="pr-register-row__budget">
                    <strong>{formatPeso(request.budget)}</strong>
                    <small>estimated budget</small>
                  </div>
                  <div className="pr-register-row__date">
                    <strong>{formatDate(request.requiredDate)}</strong>
                    <small>required date</small>
                  </div>
                  <span
                    className={`pr-status pr-status--${request.archived ? "archived" : request.status}`}
                  >
                    {request.archived
                      ? "Archived"
                      : request.status[0].toUpperCase() + request.status.slice(1)}
                  </span>
                  <Icon name="arrow" width={17} height={17} />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {creatorOpen ? (
        <div
          className="pr-creator-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setCreatorOpen(false);
          }}
        >
          <section
            className="pr-creator"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-pr-title"
          >
            <header>
              <div>
                <p className="eyebrow">New internal request</p>
                <h2 id="new-pr-title">Create a purchase request</h2>
                <p>Structured now, comparison-ready later.</p>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close purchase request form"
                onClick={() => setCreatorOpen(false)}
                disabled={saving}
              >
                <Icon name="close" />
              </button>
            </header>
            {error ? (
              <div className="form-notice form-notice--error pr-creator-error" role="alert">
                {error}
              </div>
            ) : null}
            <PurchaseRequestForm
              initialValue={emptyPurchaseRequestInput(
                user?.displayName || user?.email?.split("@")[0] || "Workspace member",
              )}
              allowClosedStatus={false}
              saving={saving}
              submitLabel="Create purchase request"
              onSubmit={handleCreate}
              onCancel={() => setCreatorOpen(false)}
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}
