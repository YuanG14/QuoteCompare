"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Icon } from "@/components/ui/icons";
import { calculateQuotationTotals, formatQuotationMoney } from "@/lib/quotations/calculations";
import {
  checksumFile,
  mergeCsvRows,
  parseQuotationCsv,
  sourceTypeForFile,
} from "@/lib/quotations/import";
import {
  hasQuotationErrors,
  validateQuotation,
  type QuotationFieldErrors,
} from "@/lib/quotations/validation";
import type { QuotationInput, QuotationLineItem } from "@/types/quotation";
import type { Rfq } from "@/types/rfq";

type Props = {
  initialValue: QuotationInput;
  rfqs: Rfq[];
  lockAssociation?: boolean;
  saving: boolean;
  submitLabel: string;
  onSubmit: (input: QuotationInput) => Promise<void>;
  onCancel: () => void;
};

export function emptyQuotationInput(): QuotationInput {
  return {
    rfqId: "",
    rfqNumber: "",
    rfqTitle: "",
    supplierId: "",
    supplierName: "",
    items: [],
    discount: 0,
    shipping: 0,
    installation: 0,
    tax: 0,
    warranty: "",
    deliveryCommitment: "",
    paymentTerms: "",
    notes: "",
    source: { type: "manual", filename: "", checksum: "" },
  };
}

function quoteItems(rfq: Rfq): QuotationLineItem[] {
  return rfq.items.map((item) => ({
    id: crypto.randomUUID(),
    rfqItemId: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: 0,
    specifications: item.specifications,
  }));
}

export function QuotationForm({
  initialValue,
  rfqs,
  lockAssociation = false,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [input, setInput] = useState(initialValue);
  const [errors, setErrors] = useState<QuotationFieldErrors>({});
  const [fileMessage, setFileMessage] = useState<string | null>(null);
  const [readingFile, setReadingFile] = useState(false);
  const selectedRfq = rfqs.find((rfq) => rfq.id === input.rfqId);
  const totals = useMemo(() => calculateQuotationTotals(input.items, input), [input]);
  const itemError = Object.entries(errors).find(([key]) => key.startsWith("item."))?.[1];

  function field<K extends keyof QuotationInput>(name: K, value: QuotationInput[K]) {
    setInput((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }
  function selectRfq(rfqId: string) {
    const rfq = rfqs.find((candidate) => candidate.id === rfqId);
    if (!rfq) return field("rfqId", "");
    setInput((current) => ({
      ...current,
      rfqId: rfq.id,
      rfqNumber: rfq.rfqNumber,
      rfqTitle: rfq.title,
      supplierId: "",
      supplierName: "",
      items: quoteItems(rfq),
    }));
    setErrors({});
  }
  function selectSupplier(supplierId: string) {
    const supplier = selectedRfq?.selectedSuppliers.find(
      (candidate) => candidate.id === supplierId,
    );
    field("supplierId", supplier?.id ?? "");
    field("supplierName", supplier?.name ?? "");
  }
  function updateItem(index: number, values: Partial<QuotationLineItem>) {
    field(
      "items",
      input.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...values } : item)),
    );
    setErrors((current) => ({
      ...current,
      [`item.${index}.quantity`]: undefined,
      [`item.${index}.unitPrice`]: undefined,
    }));
  }
  function amount(name: "discount" | "shipping" | "installation" | "tax", value: string) {
    field(name, value === "" ? 0 : Number(value));
  }
  async function readLocalFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const type = sourceTypeForFile(file);
    if (!type) return setFileMessage("Choose a CSV, PDF, XLSX, or XLS file.");
    if (file.size > 10 * 1024 * 1024)
      return setFileMessage("Keep local source files at or below 10 MB.");
    setReadingFile(true);
    setFileMessage(null);
    try {
      const checksum = await checksumFile(file);
      let nextItems = input.items;
      if (type === "csv") {
        const rows = parseQuotationCsv(await file.text());
        nextItems = mergeCsvRows(input.items, rows);
        setFileMessage(
          `Matched ${Math.min(rows.length, input.items.length)} CSV rows. Review every value before saving.`,
        );
      } else {
        setFileMessage(
          `${type === "pdf" ? "PDF" : "Excel"} source identified locally. Enter its values manually and review them before saving.`,
        );
      }
      setInput((current) => ({
        ...current,
        items: nextItems,
        source: { type, filename: file.name, checksum },
      }));
    } catch (error) {
      setFileMessage(error instanceof Error ? error.message : "The local file could not be read.");
    } finally {
      setReadingFile(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateQuotation(input);
    setErrors(nextErrors);
    if (!hasQuotationErrors(nextErrors)) await onSubmit(input);
  }

  return (
    <form className="quotation-form" onSubmit={submit} noValidate>
      <section className="quotation-section">
        <div className="quotation-section__heading">
          <span>01</span>
          <div>
            <h2>RFQ and supplier</h2>
            <p>Every quotation belongs to one issued request and one invited supplier.</p>
          </div>
        </div>
        <div className="quotation-grid">
          <label className="form-field">
            <span className="form-label">Issued RFQ</span>
            <select
              className={`form-input ${errors.rfqId ? "form-input--error" : ""}`}
              value={input.rfqId}
              onChange={(event) => selectRfq(event.target.value)}
              disabled={lockAssociation}
            >
              <option value="">Select an issued RFQ</option>
              {rfqs.map((rfq) => (
                <option value={rfq.id} key={rfq.id}>
                  {rfq.rfqNumber} — {rfq.title}
                </option>
              ))}
            </select>
            {errors.rfqId ? <span className="form-error">{errors.rfqId}</span> : null}
          </label>
          <label className="form-field">
            <span className="form-label">Invited supplier</span>
            <select
              className={`form-input ${errors.supplierId ? "form-input--error" : ""}`}
              value={input.supplierId}
              onChange={(event) => selectSupplier(event.target.value)}
              disabled={!selectedRfq || lockAssociation}
            >
              <option value="">Select a supplier</option>
              {selectedRfq?.selectedSuppliers.map((supplier) => (
                <option value={supplier.id} key={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {errors.supplierId ? (
              <span className="form-error">{errors.supplierId}</span>
            ) : (
              <span className="form-hint">Only suppliers selected on the RFQ appear here.</span>
            )}
          </label>
        </div>
      </section>

      <section className="quotation-section quotation-section--dark">
        <div className="quotation-section__heading">
          <span>02</span>
          <div>
            <h2>Local source</h2>
            <p>Read a supplier file in this browser. The document is never uploaded.</p>
          </div>
        </div>
        <label className="quotation-dropzone">
          <input
            type="file"
            accept=".csv,.pdf,.xlsx,.xls,text/csv,application/pdf"
            onChange={readLocalFile}
            disabled={readingFile || input.items.length === 0}
          />
          <Icon name="upload" width={24} height={24} />
          <strong>
            {readingFile
              ? "Reading locally…"
              : input.source.filename || "Choose a local quotation file"}
          </strong>
          <span>
            CSV values can be matched automatically. PDF and Excel remain local references for
            manual entry. Maximum 10 MB.
          </span>
        </label>
        {fileMessage ? <div className="quotation-file-note">{fileMessage}</div> : null}
        {input.source.checksum ? (
          <div className="quotation-source-meta">
            <span>{input.source.type.toUpperCase()}</span>
            <code>SHA-256 {input.source.checksum.slice(0, 16)}…</code>
            <button
              type="button"
              onClick={() => field("source", { type: "manual", filename: "", checksum: "" })}
            >
              Clear source
            </button>
          </div>
        ) : null}
      </section>

      <section className="quotation-section">
        <div className="quotation-section__heading">
          <span>03</span>
          <div>
            <h2>Quoted items</h2>
            <p>Confirm quantity, unit, specifications, and supplier unit price.</p>
          </div>
        </div>
        {errors.items || itemError ? (
          <div className="form-notice form-notice--error">{errors.items || itemError}</div>
        ) : null}
        <div className="quotation-lines">
          {input.items.length === 0 ? (
            <div className="quotation-lines__empty">Select an RFQ to load its requested items.</div>
          ) : (
            input.items.map((item, index) => (
              <article className="quotation-line" key={item.id}>
                <span className="quotation-line__number">{String(index + 1).padStart(2, "0")}</span>
                <div className="quotation-line__identity">
                  <strong>{item.name}</strong>
                  <p>{item.specifications || "No specifications recorded"}</p>
                </div>
                <label className="form-field">
                  <span className="form-label">Quantity</span>
                  <input
                    className="form-input"
                    type="number"
                    min="0.01"
                    step="any"
                    value={item.quantity || ""}
                    onChange={(event) =>
                      updateItem(index, {
                        quantity: event.target.value === "" ? 0 : Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="form-field">
                  <span className="form-label">Unit</span>
                  <input
                    className="form-input"
                    value={item.unit}
                    maxLength={30}
                    onChange={(event) => updateItem(index, { unit: event.target.value })}
                  />
                </label>
                <label className="form-field">
                  <span className="form-label">Unit price (PHP)</span>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice || ""}
                    onChange={(event) =>
                      updateItem(index, {
                        unitPrice: event.target.value === "" ? 0 : Number(event.target.value),
                      })
                    }
                  />
                </label>
                <div className="quotation-line__total">
                  <span>Line total</span>
                  <strong>{formatQuotationMoney(item.quantity * item.unitPrice)}</strong>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="quotation-section quotation-section--tinted">
        <div className="quotation-section__heading">
          <span>04</span>
          <div>
            <h2>Commercial terms</h2>
            <p>Separate every cost component so later comparisons remain transparent.</p>
          </div>
        </div>
        <div className="quotation-cost-grid">
          {(["discount", "shipping", "installation", "tax"] as const).map((name) => (
            <label className="form-field" key={name}>
              <span className="form-label">{name[0].toUpperCase() + name.slice(1)} (PHP)</span>
              <input
                className={`form-input ${errors[name] ? "form-input--error" : ""}`}
                type="number"
                min="0"
                step="0.01"
                value={input[name] || ""}
                onChange={(event) => amount(name, event.target.value)}
              />
              {errors[name] ? <span className="form-error">{errors[name]}</span> : null}
            </label>
          ))}
        </div>
        <div className="quotation-grid quotation-grid--terms">
          {(
            [
              ["warranty", "Warranty"],
              ["deliveryCommitment", "Delivery commitment"],
              ["paymentTerms", "Payment terms"],
            ] as const
          ).map(([name, label]) => (
            <label className="form-field" key={name}>
              <span className="form-label">{label}</span>
              <textarea
                className={`form-input form-textarea ${errors[name] ? "form-input--error" : ""}`}
                rows={4}
                value={input[name]}
                maxLength={500}
                onChange={(event) => field(name, event.target.value)}
              />
              {errors[name] ? <span className="form-error">{errors[name]}</span> : null}
            </label>
          ))}
          <label className="form-field">
            <span className="form-label">Internal notes</span>
            <textarea
              className="form-input form-textarea"
              rows={4}
              value={input.notes}
              maxLength={1000}
              onChange={(event) => field("notes", event.target.value)}
            />
          </label>
        </div>
      </section>

      <footer className="quotation-form-actions">
        <div>
          <span>Calculated grand total</span>
          <strong>{formatQuotationMoney(totals.grandTotal)}</strong>
          <small>
            Subtotal {formatQuotationMoney(totals.subtotal)} · deterministic PHP calculation
          </small>
        </div>
        <button
          className="button button--secondary"
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button className="button button--accent" type="submit" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
      </footer>
    </form>
  );
}
