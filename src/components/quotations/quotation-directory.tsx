"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { calculateQuotationTotals, formatQuotationMoney } from "@/lib/quotations/calculations";
import { getQuotationErrorMessage } from "@/lib/quotations/errors";
import { listQuotations } from "@/lib/quotations/service";
import { useOrganization } from "@/providers/organization-provider";
import type { Quotation, QuotationStatus } from "@/types/quotation";

const labels: Record<QuotationStatus, string> = {
  draft: "Draft",
  needs_review: "Needs review",
  verified: "Verified",
};

export function QuotationDirectory() {
  const { organization, can } = useOrganization();
  const [records, setRecords] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | QuotationStatus>("all");
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      setRecords(await listQuotations(organization.id));
    } catch (nextError) {
      setError(getQuotationErrorMessage(nextError));
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
    return records.filter(
      (record) =>
        (status === "all" || record.status === status) &&
        (!needle ||
          [
            record.quotationNumber,
            record.rfqNumber,
            record.rfqTitle,
            record.supplierName,
            record.source.filename,
          ].some((value) => value.toLowerCase().includes(needle))),
    );
  }, [records, search, status]);
  const reviewCount = records.filter((record) => record.status === "needs_review").length;
  const verifiedCount = records.filter((record) => record.status === "verified").length;
  const totalValue = records
    .filter((record) => record.status === "verified")
    .reduce((sum, record) => sum + calculateQuotationTotals(record.items, record).grandTotal, 0);
  if (!organization) return null;
  return (
    <div className="page-stack quotation-directory-page">
      <header className="quotation-page-header">
        <div>
          <p className="eyebrow">Quotation intake · Phase 7</p>
          <h1>Capture supplier offers without storing their files.</h1>
          <p className="page-subtitle">
            Enter quotations manually or read a local CSV, PDF, or spreadsheet. Only structured
            values and source metadata are saved to Firestore.
          </p>
        </div>
        {can("quotations.manage") ? (
          <Link className="button button--accent" href="/quotations/new">
            <Icon name="plus" width={18} height={18} />
            Add quotation
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
      <section className="quotation-ledger">
        <article>
          <span>Total quotations</span>
          <strong>{records.length}</strong>
          <small>organization records</small>
        </article>
        <article>
          <span>Needs review</span>
          <strong>{reviewCount}</strong>
          <small>awaiting a decision</small>
        </article>
        <article>
          <span>Verified</span>
          <strong>{verifiedCount}</strong>
          <small>locked for comparison</small>
        </article>
        <aside>
          <span>Verified value</span>
          <strong>{formatQuotationMoney(totalValue)}</strong>
          <small>not an award decision</small>
        </aside>
      </section>
      <section className="quotation-register">
        <div className="quotation-register__heading">
          <div>
            <p className="eyebrow">Quotation register</p>
            <h2>Supplier responses</h2>
          </div>
          <span>
            {loading ? "Loading quotations…" : `${visible.length} of ${records.length} shown`}
          </span>
        </div>
        <div className="rfq-toolbar">
          <label className="supplier-search">
            <Icon name="search" width={18} height={18} />
            <span className="sr-only">Search quotations</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search quotation, RFQ, supplier, or source file"
            />
          </label>
          <div className="pr-filter-tabs" role="group" aria-label="Filter quotations">
            {(["all", "draft", "needs_review", "verified"] as const).map((value) => (
              <button
                type="button"
                key={value}
                className={status === value ? "pr-filter-tab--active" : ""}
                onClick={() => setStatus(value)}
              >
                {value === "all" ? "All" : labels[value]}
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
          <div className="supplier-empty quotation-empty">
            <span className="supplier-empty__index">00 / NO QUOTATIONS</span>
            <h3>
              {records.length
                ? "No quotations match this view."
                : "Record the first supplier response."}
            </h3>
            <p>
              {records.length
                ? "Clear the search or choose another review status."
                : "Start from an Issued RFQ and select one of its invited suppliers. You can enter values manually or use a local file."}
            </p>
            {!records.length && can("quotations.manage") ? (
              <Link className="text-link" href="/quotations/new">
                Add the first quotation <Icon name="arrow" width={16} height={16} />
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="quotation-register-list">
            {visible.map((record) => {
              const totals = calculateQuotationTotals(record.items, record);
              return (
                <Link
                  className="quotation-register-row"
                  href={`/quotations/${record.id}`}
                  key={record.id}
                >
                  <div>
                    <span>{record.quotationNumber}</span>
                    <small>{record.rfqNumber}</small>
                  </div>
                  <div>
                    <strong>{record.supplierName}</strong>
                    <small>{record.rfqTitle}</small>
                  </div>
                  <div>
                    <strong>{record.items.length}</strong>
                    <small>item lines</small>
                  </div>
                  <div>
                    <strong>{formatQuotationMoney(totals.grandTotal)}</strong>
                    <small>grand total</small>
                  </div>
                  <div>
                    <strong>
                      {record.source.type === "manual"
                        ? "Manual"
                        : record.source.type.toUpperCase()}
                    </strong>
                    <small>{record.source.filename || "No source file"}</small>
                  </div>
                  <span className={`quotation-status quotation-status--${record.status}`}>
                    {labels[record.status]}
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
