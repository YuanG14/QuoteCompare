"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icons";
import { calculateRfqSummary } from "@/lib/rfqs/calculations";
import { hasRfqErrors, validateRfq, type RfqFieldErrors } from "@/lib/rfqs/validation";
import type { PurchaseRequest, PurchaseRequestItem } from "@/types/purchase-request";
import type { RfqCriterion, RfqCriterionImportance, RfqInput } from "@/types/rfq";
import type { Supplier } from "@/types/supplier";

type RfqFormProps = {
  initialValue: RfqInput;
  purchaseRequests: PurchaseRequest[];
  suppliers: Supplier[];
  lockPurchaseRequest?: boolean;
  saving: boolean;
  submitLabel: string;
  onSubmit: (input: RfqInput) => Promise<void>;
  onCancel: () => void;
};

function newItem(): PurchaseRequestItem {
  return { id: crypto.randomUUID(), name: "", quantity: 1, unit: "piece", specifications: "" };
}
function newCriterion(): RfqCriterion {
  return { id: crypto.randomUUID(), label: "", description: "", importance: "required" };
}

export function emptyRfqInput(): RfqInput {
  return {
    purchaseRequestId: "",
    purchaseRequestNumber: "",
    purchaseRequestTitle: "",
    title: "",
    items: [],
    criteria: [newCriterion()],
    quotationDeadline: "",
    deliveryDestination: "",
    paymentExpectations: "",
    evaluationCriteria:
      "Price, compliance with required specifications, delivery commitment, warranty, and payment terms will be reviewed before a human award decision.",
    selectedSuppliers: [],
  };
}

export function RfqForm({
  initialValue,
  purchaseRequests,
  suppliers,
  lockPurchaseRequest = false,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: RfqFormProps) {
  const [input, setInput] = useState<RfqInput>(initialValue);
  const [errors, setErrors] = useState<RfqFieldErrors>({});
  const selectedRequest = purchaseRequests.find(
    (request) => request.id === input.purchaseRequestId,
  );
  const summary = useMemo(
    () => calculateRfqSummary(input.items, input.criteria, input.selectedSuppliers),
    [input.criteria, input.items, input.selectedSuppliers],
  );
  const itemError = Object.entries(errors).find(([key]) => key.startsWith("item."))?.[1];
  const criterionError = Object.entries(errors).find(([key]) => key.startsWith("criterion."))?.[1];

  function updateField<K extends keyof RfqInput>(field: K, value: RfqInput[K]) {
    setInput((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function selectPurchaseRequest(requestId: string) {
    const request = purchaseRequests.find((candidate) => candidate.id === requestId);
    if (!request) {
      updateField("purchaseRequestId", "");
      return;
    }
    setInput((current) => ({
      ...current,
      purchaseRequestId: request.id,
      purchaseRequestNumber: request.requestNumber,
      purchaseRequestTitle: request.title,
      title: `Request for quotation — ${request.title}`,
      items: request.items.map((item) => ({ ...item })),
    }));
    setErrors((current) => ({
      ...current,
      purchaseRequestId: undefined,
      title: undefined,
      items: undefined,
    }));
  }

  function updateItem<K extends keyof PurchaseRequestItem>(
    index: number,
    field: K,
    value: PurchaseRequestItem[K],
  ) {
    setInput((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
    setErrors((current) => ({
      ...current,
      [`item.${index}.${field}`]: undefined,
      items: undefined,
    }));
  }

  function updateCriterion<K extends keyof RfqCriterion>(
    index: number,
    field: K,
    value: RfqCriterion[K],
  ) {
    setInput((current) => ({
      ...current,
      criteria: current.criteria.map((criterion, criterionIndex) =>
        criterionIndex === index ? { ...criterion, [field]: value } : criterion,
      ),
    }));
    setErrors((current) => ({
      ...current,
      [`criterion.${index}.${field}`]: undefined,
      criteria: undefined,
    }));
  }

  function toggleSupplier(supplier: Supplier) {
    const selected = input.selectedSuppliers.some((candidate) => candidate.id === supplier.id);
    updateField(
      "selectedSuppliers",
      selected
        ? input.selectedSuppliers.filter((candidate) => candidate.id !== supplier.id)
        : [...input.selectedSuppliers, { id: supplier.id, name: supplier.name }],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateRfq(input, selectedRequest?.requiredDate);
    setErrors(nextErrors);
    if (hasRfqErrors(nextErrors)) return;
    await onSubmit(input);
  }

  return (
    <form className="rfq-form" onSubmit={handleSubmit} noValidate>
      <section className="rfq-form-section">
        <div className="rfq-form-heading">
          <span>01</span>
          <div>
            <h2>Source request</h2>
            <p>Anchor the RFQ to an approved internal need.</p>
          </div>
        </div>
        <div className="rfq-form-grid">
          <label className="form-field rfq-form-wide">
            <span className="form-label">Open purchase request</span>
            <select
              className={`form-input ${errors.purchaseRequestId ? "form-input--error" : ""}`}
              value={input.purchaseRequestId}
              onChange={(event) => selectPurchaseRequest(event.target.value)}
              disabled={lockPurchaseRequest}
            >
              <option value="">Select a purchase request</option>
              {purchaseRequests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.requestNumber} — {request.title}
                </option>
              ))}
            </select>
            {errors.purchaseRequestId ? (
              <span className="form-error">{errors.purchaseRequestId}</span>
            ) : lockPurchaseRequest ? (
              <span className="form-hint">
                The source request cannot be changed after the RFQ is created.
              </span>
            ) : (
              <span className="form-hint">
                Only Open, non-archived purchase requests are available.
              </span>
            )}
          </label>
          <label className="form-field rfq-form-wide">
            <span className="form-label">RFQ title</span>
            <input
              className={`form-input ${errors.title ? "form-input--error" : ""}`}
              value={input.title}
              onChange={(event) => updateField("title", event.target.value)}
              maxLength={160}
              placeholder="Select a purchase request to begin"
            />
            {errors.title ? <span className="form-error">{errors.title}</span> : null}
          </label>
        </div>
        {selectedRequest ? (
          <div className="rfq-source-note">
            <span>{selectedRequest.requestNumber}</span>
            <div>
              <strong>{selectedRequest.department}</strong>
              <p>
                Budget{" "}
                {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
                  selectedRequest.budget,
                )}{" "}
                · Required {selectedRequest.requiredDate}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rfq-form-section rfq-form-section--tinted">
        <div className="rfq-form-heading rfq-form-heading--action">
          <span>02</span>
          <div>
            <h2>Requested items</h2>
            <p>
              {summary.itemLines} {summary.itemLines === 1 ? "line" : "lines"} ·{" "}
              {summary.totalQuantity.toLocaleString("en-PH")} total units
            </p>
          </div>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => updateField("items", [...input.items, newItem()])}
            disabled={input.items.length >= 30}
          >
            <Icon name="plus" width={16} height={16} />
            Add item
          </button>
        </div>
        {errors.items || itemError ? (
          <div className="form-notice form-notice--error">{errors.items || itemError}</div>
        ) : null}
        <div className="rfq-line-list">
          {input.items.map((item, index) => (
            <article className="rfq-line" key={item.id}>
              <div className="rfq-line__index">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <button
                  type="button"
                  aria-label={`Remove item ${index + 1}`}
                  onClick={() =>
                    updateField(
                      "items",
                      input.items.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  disabled={input.items.length === 1}
                >
                  <Icon name="close" width={16} height={16} />
                </button>
              </div>
              <div className="rfq-line__fields">
                <label className="form-field rfq-line__name">
                  <span className="form-label">Item or service</span>
                  <input
                    className={`form-input ${errors[`item.${index}.name`] ? "form-input--error" : ""}`}
                    value={item.name}
                    onChange={(event) => updateItem(index, "name", event.target.value)}
                    maxLength={140}
                  />
                </label>
                <label className="form-field">
                  <span className="form-label">Quantity</span>
                  <input
                    className={`form-input ${errors[`item.${index}.quantity`] ? "form-input--error" : ""}`}
                    type="number"
                    min="0.01"
                    max="1000000"
                    step="any"
                    value={item.quantity || ""}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "quantity",
                        event.target.value === "" ? 0 : Number(event.target.value),
                      )
                    }
                  />
                </label>
                <label className="form-field">
                  <span className="form-label">Unit</span>
                  <input
                    className={`form-input ${errors[`item.${index}.unit`] ? "form-input--error" : ""}`}
                    value={item.unit}
                    onChange={(event) => updateItem(index, "unit", event.target.value)}
                    maxLength={30}
                  />
                </label>
                <label className="form-field rfq-line__spec">
                  <span className="form-label">Specifications</span>
                  <textarea
                    className={`form-input form-textarea ${errors[`item.${index}.specifications`] ? "form-input--error" : ""}`}
                    value={item.specifications}
                    onChange={(event) => updateItem(index, "specifications", event.target.value)}
                    maxLength={600}
                    rows={3}
                    placeholder="Required dimensions, standards, compatibility, materials, or scope"
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rfq-form-section">
        <div className="rfq-form-heading rfq-form-heading--action">
          <span>03</span>
          <div>
            <h2>Requirements</h2>
            <p>
              {summary.requiredCriteria} required · {summary.preferredCriteria} preferred
            </p>
          </div>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => updateField("criteria", [...input.criteria, newCriterion()])}
            disabled={input.criteria.length >= 20}
          >
            <Icon name="plus" width={16} height={16} />
            Add criterion
          </button>
        </div>
        {errors.criteria || criterionError ? (
          <div className="form-notice form-notice--error">{errors.criteria || criterionError}</div>
        ) : null}
        <div className="rfq-criteria-list">
          {input.criteria.map((criterion, index) => (
            <article className="rfq-criterion" key={criterion.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div className="rfq-criterion__fields">
                <label className="form-field">
                  <span className="form-label">Criterion</span>
                  <input
                    className={`form-input ${errors[`criterion.${index}.label`] ? "form-input--error" : ""}`}
                    value={criterion.label}
                    onChange={(event) => updateCriterion(index, "label", event.target.value)}
                    maxLength={120}
                    placeholder="e.g. Three-year onsite warranty"
                  />
                </label>
                <label className="form-field">
                  <span className="form-label">Importance</span>
                  <select
                    className="form-input"
                    value={criterion.importance}
                    onChange={(event) =>
                      updateCriterion(
                        index,
                        "importance",
                        event.target.value as RfqCriterionImportance,
                      )
                    }
                  >
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                  </select>
                </label>
                <label className="form-field rfq-criterion__description">
                  <span className="form-label">
                    Clarification <small>Optional</small>
                  </span>
                  <textarea
                    className={`form-input form-textarea ${errors[`criterion.${index}.description`] ? "form-input--error" : ""}`}
                    value={criterion.description}
                    onChange={(event) => updateCriterion(index, "description", event.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder="Explain how suppliers should demonstrate compliance"
                  />
                </label>
              </div>
              <button
                className="rfq-remove"
                type="button"
                aria-label={`Remove criterion ${index + 1}`}
                onClick={() =>
                  updateField(
                    "criteria",
                    input.criteria.filter((_, criterionIndex) => criterionIndex !== index),
                  )
                }
                disabled={input.criteria.length === 1}
              >
                <Icon name="close" width={16} height={16} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="rfq-form-section">
        <div className="rfq-form-heading">
          <span>04</span>
          <div>
            <h2>Commercial terms</h2>
            <p>Tell suppliers when, where, and under what expectations to quote.</p>
          </div>
        </div>
        <div className="rfq-form-grid">
          <label className="form-field">
            <span className="form-label">Quotation deadline</span>
            <input
              className={`form-input ${errors.quotationDeadline ? "form-input--error" : ""}`}
              type="date"
              value={input.quotationDeadline}
              onChange={(event) => updateField("quotationDeadline", event.target.value)}
            />
            {errors.quotationDeadline ? (
              <span className="form-error">{errors.quotationDeadline}</span>
            ) : null}
          </label>
          <label className="form-field">
            <span className="form-label">Delivery destination</span>
            <input
              className={`form-input ${errors.deliveryDestination ? "form-input--error" : ""}`}
              value={input.deliveryDestination}
              onChange={(event) => updateField("deliveryDestination", event.target.value)}
              maxLength={240}
              placeholder="Site, building, city, or complete address"
            />
            {errors.deliveryDestination ? (
              <span className="form-error">{errors.deliveryDestination}</span>
            ) : null}
          </label>
          <label className="form-field rfq-form-wide">
            <span className="form-label">Payment expectations</span>
            <textarea
              className={`form-input form-textarea ${errors.paymentExpectations ? "form-input--error" : ""}`}
              value={input.paymentExpectations}
              onChange={(event) => updateField("paymentExpectations", event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="e.g. State payment terms, tax treatment, quote validity, and invoicing expectations"
            />
            {errors.paymentExpectations ? (
              <span className="form-error">{errors.paymentExpectations}</span>
            ) : null}
          </label>
          <label className="form-field rfq-form-wide">
            <span className="form-label">Evaluation approach</span>
            <textarea
              className={`form-input form-textarea ${errors.evaluationCriteria ? "form-input--error" : ""}`}
              value={input.evaluationCriteria}
              onChange={(event) => updateField("evaluationCriteria", event.target.value)}
              maxLength={900}
              rows={4}
            />
            {errors.evaluationCriteria ? (
              <span className="form-error">{errors.evaluationCriteria}</span>
            ) : (
              <span className="form-hint">
                This is descriptive in Phase 6. Deterministic weighting arrives in Phase 11.
              </span>
            )}
          </label>
        </div>
      </section>

      <section className="rfq-form-section rfq-form-section--dark">
        <div className="rfq-form-heading">
          <span>05</span>
          <div>
            <h2>Supplier shortlist</h2>
            <p>Select active suppliers that should receive this RFQ.</p>
          </div>
        </div>
        {errors.selectedSuppliers ? (
          <div className="form-notice form-notice--warning">{errors.selectedSuppliers}</div>
        ) : null}
        <div className="rfq-supplier-options">
          {suppliers.length ? (
            suppliers.map((supplier) => {
              const selected = input.selectedSuppliers.some(
                (candidate) => candidate.id === supplier.id,
              );
              return (
                <label
                  className={`rfq-supplier-option ${selected ? "rfq-supplier-option--selected" : ""}`}
                  key={supplier.id}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSupplier(supplier)}
                    disabled={!selected && input.selectedSuppliers.length >= 20}
                  />
                  <span className="rfq-supplier-option__mark">
                    {selected ? (
                      <Icon name="check" width={17} height={17} />
                    ) : (
                      supplier.name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <span>
                    <strong>{supplier.name}</strong>
                    <small>
                      {supplier.category} · {supplier.contactName || "No named contact"}
                    </small>
                  </span>
                </label>
              );
            })
          ) : (
            <p className="rfq-no-suppliers">
              No active suppliers are available. Add or reactivate suppliers before creating an RFQ.
            </p>
          )}
        </div>
      </section>

      <footer className="rfq-form-actions">
        <div>
          <strong>Draft preview</strong>
          <span>
            {summary.itemLines} items · {summary.requiredCriteria + summary.preferredCriteria}{" "}
            criteria · {summary.invitedSuppliers} suppliers
          </span>
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
          {saving ? "Saving RFQ…" : submitLabel}
        </button>
      </footer>
    </form>
  );
}
