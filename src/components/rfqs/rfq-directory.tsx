"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { calculateRfqSummary } from "@/lib/rfqs/calculations";
import { getRfqErrorMessage } from "@/lib/rfqs/errors";
import { listRfqs } from "@/lib/rfqs/service";
import { useOrganization } from "@/providers/organization-provider";
import type { Rfq, RfqStatus } from "@/types/rfq";

function formatDate(value: string): string {
  return value
    ? new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${value}T00:00:00Z`))
    : "No deadline";
}

export function RfqDirectory() {
  const { organization, can } = useOrganization();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | RfqStatus>("all");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      setRfqs(await listRfqs(organization.id));
    } catch (nextError) {
      setError(getRfqErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rfqs.filter(
      (rfq) =>
        (status === "all" || rfq.status === status) &&
        (!needle ||
          [
            rfq.rfqNumber,
            rfq.title,
            rfq.purchaseRequestNumber,
            rfq.purchaseRequestTitle,
            ...rfq.selectedSuppliers.map((supplier) => supplier.name),
          ].some((value) => value.toLowerCase().includes(needle))),
    );
  }, [rfqs, search, status]);

  const drafts = rfqs.filter((rfq) => rfq.status === "draft").length;
  const issued = rfqs.filter((rfq) => rfq.status === "issued").length;
  const supplierInvites = rfqs
    .filter((rfq) => rfq.status !== "closed")
    .reduce((total, rfq) => total + rfq.selectedSuppliers.length, 0);

  if (!organization) return null;
  return (
    <div className="page-stack rfq-directory-page">
      <header className="rfq-page-header">
        <div>
          <p className="eyebrow">RFQ builder · Phase 6</p>
          <h1>Turn approved needs into clear supplier requests.</h1>
          <p className="page-subtitle">
            Build structured requests for quotation from Open purchase requests, define commercial
            expectations, and select the suppliers invited to respond.
          </p>
        </div>
        {can("quotations.manage") ? (
          <Link className="button button--accent" href="/rfqs/new">
            <Icon name="plus" width={18} height={18} />
            Build an RFQ
          </Link>
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
      <section className="rfq-ledger">
        <article>
          <span>Drafts</span>
          <strong>{drafts}</strong>
          <small>still being prepared</small>
        </article>
        <article>
          <span>Issued</span>
          <strong>{issued}</strong>
          <small>awaiting quotations</small>
        </article>
        <article>
          <span>Supplier invitations</span>
          <strong>{supplierInvites}</strong>
          <small>across active RFQs</small>
        </article>
        <aside>
          <span>QC / RFQ</span>
          <p>One source request. One consistent brief for every supplier.</p>
        </aside>
      </section>
      <section className="rfq-register" aria-labelledby="rfq-register-title">
        <div className="rfq-register__heading">
          <div>
            <p className="eyebrow">RFQ register</p>
            <h2 id="rfq-register-title">Requests for quotation</h2>
          </div>
          <span>{loading ? "Loading RFQs…" : `${visible.length} of ${rfqs.length} shown`}</span>
        </div>
        <div className="rfq-toolbar">
          <label className="supplier-search">
            <Icon name="search" width={18} height={18} />
            <span className="sr-only">Search RFQs</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search RFQ, purchase request, title, or supplier"
            />
          </label>
          <div className="pr-filter-tabs" role="group" aria-label="Filter RFQs">
            {(["all", "draft", "issued", "closed"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={status === value ? "pr-filter-tab--active" : ""}
                onClick={() => setStatus(value)}
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
          <div className="supplier-empty rfq-empty">
            <span className="supplier-empty__index">00 / NO RFQS</span>
            <h3>
              {rfqs.length === 0
                ? "Create a consistent brief for supplier pricing."
                : "No RFQs match this view."}
            </h3>
            <p>
              {rfqs.length === 0
                ? "Select an Open purchase request, refine the items and requirements, set commercial expectations, then choose the active suppliers you want to invite."
                : "Clear the search or choose another lifecycle status."}
            </p>
            {rfqs.length === 0 && can("quotations.manage") ? (
              <Link className="text-link" href="/rfqs/new">
                Build the first RFQ <Icon name="arrow" width={16} height={16} />
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="rfq-register-list">
            {visible.map((rfq) => {
              const summary = calculateRfqSummary(rfq.items, rfq.criteria, rfq.selectedSuppliers);
              return (
                <Link className="rfq-register-row" href={`/rfqs/${rfq.id}`} key={rfq.id}>
                  <div className="rfq-register-row__id">
                    <span>{rfq.rfqNumber}</span>
                    <small>{rfq.purchaseRequestNumber}</small>
                  </div>
                  <div className="rfq-register-row__title">
                    <strong>{rfq.title}</strong>
                    <small>{rfq.purchaseRequestTitle}</small>
                  </div>
                  <div>
                    <strong>{summary.itemLines}</strong>
                    <small>item lines</small>
                  </div>
                  <div>
                    <strong>{summary.invitedSuppliers}</strong>
                    <small>suppliers</small>
                  </div>
                  <div>
                    <strong>{formatDate(rfq.quotationDeadline)}</strong>
                    <small>quote deadline</small>
                  </div>
                  <span className={`rfq-status rfq-status--${rfq.status}`}>
                    {rfq.status[0].toUpperCase() + rfq.status.slice(1)}
                  </span>
                  <Icon name="arrow" width={17} height={17} />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
