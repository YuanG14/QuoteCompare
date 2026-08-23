"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icons";
import { calculatePurchaseRequestSummary, formatPeso } from "@/lib/purchase-requests/calculations";
import {
  hasPurchaseRequestErrors,
  validatePurchaseRequest,
  type PurchaseRequestFieldErrors,
} from "@/lib/purchase-requests/validation";
import type {
  PurchaseRequestInput,
  PurchaseRequestItem,
  PurchaseRequestStatus,
} from "@/types/purchase-request";

type PurchaseRequestFormProps = {
  initialValue: PurchaseRequestInput;
  allowClosedStatus: boolean;
  saving: boolean;
  submitLabel: string;
  onSubmit: (input: PurchaseRequestInput) => Promise<void>;
  onCancel: () => void;
};

function newItem(): PurchaseRequestItem {
  return { id: crypto.randomUUID(), name: "", quantity: 1, unit: "piece", specifications: "" };
}

export function emptyPurchaseRequestInput(requesterName: string): PurchaseRequestInput {
  return {
    title: "",
    requesterName,
    department: "",
    purpose: "",
    budget: 0,
    requiredDate: "",
    items: [newItem()],
    notes: "",
    status: "draft",
  };
}

export function PurchaseRequestForm({
  initialValue,
  allowClosedStatus,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: PurchaseRequestFormProps) {
  const [input, setInput] = useState<PurchaseRequestInput>(initialValue);
  const [errors, setErrors] = useState<PurchaseRequestFieldErrors>({});
  const summary = useMemo(() => calculatePurchaseRequestSummary(input.items), [input.items]);

  function updateField<K extends keyof PurchaseRequestInput>(
    field: K,
    value: PurchaseRequestInput[K],
  ) {
    setInput((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
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

  function addItem() {
    if (input.items.length >= 30) return;
    updateField("items", [...input.items, newItem()]);
  }

  function removeItem(index: number) {
    if (input.items.length === 1) return;
    updateField(
      "items",
      input.items.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validatePurchaseRequest(input);
    setErrors(nextErrors);
    if (hasPurchaseRequestErrors(nextErrors)) return;
    await onSubmit(input);
  }

  return (
    <form className="purchase-request-form" onSubmit={handleSubmit} noValidate>
      <section className="pr-form-section">
        <div className="pr-form-section__heading">
          <span>01</span>
          <div>
            <h3>Request details</h3>
            <p>Identify who needs the purchase and why it matters.</p>
          </div>
        </div>
        <div className="pr-form-grid">
          <label className="form-field pr-form-wide">
            <span className="form-label">Request title</span>
            <input
              className={`form-input ${errors.title ? "form-input--error" : ""}`}
              value={input.title}
              onChange={(event) => updateField("title", event.target.value)}
              maxLength={140}
              autoFocus
              placeholder="e.g. Replace design team workstations"
            />
            {errors.title ? <span className="form-error">{errors.title}</span> : null}
          </label>
          <label className="form-field">
            <span className="form-label">Requester</span>
            <input
              className={`form-input ${errors.requesterName ? "form-input--error" : ""}`}
              value={input.requesterName}
              onChange={(event) => updateField("requesterName", event.target.value)}
              maxLength={100}
              placeholder="Full name"
            />
            {errors.requesterName ? (
              <span className="form-error">{errors.requesterName}</span>
            ) : null}
          </label>
          <label className="form-field">
            <span className="form-label">Department</span>
            <input
              className={`form-input ${errors.department ? "form-input--error" : ""}`}
              value={input.department}
              onChange={(event) => updateField("department", event.target.value)}
              maxLength={100}
              placeholder="e.g. Information Technology"
            />
            {errors.department ? <span className="form-error">{errors.department}</span> : null}
          </label>
          <label className="form-field pr-form-wide">
            <span className="form-label">Business purpose</span>
            <textarea
              className={`form-input form-textarea ${errors.purpose ? "form-input--error" : ""}`}
              value={input.purpose}
              onChange={(event) => updateField("purpose", event.target.value)}
              maxLength={800}
              rows={4}
              placeholder="Explain the need, expected outcome, and relevant context."
            />
            {errors.purpose ? (
              <span className="form-error">{errors.purpose}</span>
            ) : (
              <span className="form-hint">{input.purpose.length}/800 characters</span>
            )}
          </label>
        </div>
      </section>

      <section className="pr-form-section">
        <div className="pr-form-section__heading">
          <span>02</span>
          <div>
            <h3>Budget and timing</h3>
            <p>Set the planning ceiling and when the goods or services are required.</p>
          </div>
        </div>
        <div className="pr-form-grid">
          <label className="form-field">
            <span className="form-label">Estimated budget</span>
            <div className="currency-input">
              <span>₱</span>
              <input
                className={errors.budget ? "form-input--error" : ""}
                type="number"
                min="0"
                max="1000000000"
                step="0.01"
                value={input.budget || ""}
                onChange={(event) =>
                  updateField("budget", event.target.value === "" ? 0 : Number(event.target.value))
                }
                placeholder="0.00"
              />
            </div>
            {errors.budget ? (
              <span className="form-error">{errors.budget}</span>
            ) : (
              <span className="form-hint">Current ceiling: {formatPeso(input.budget)}</span>
            )}
          </label>
          <label className="form-field">
            <span className="form-label">Required date</span>
            <input
              className={`form-input ${errors.requiredDate ? "form-input--error" : ""}`}
              type="date"
              value={input.requiredDate}
              onChange={(event) => updateField("requiredDate", event.target.value)}
            />
            {errors.requiredDate ? (
              <span className="form-error">{errors.requiredDate}</span>
            ) : (
              <span className="form-hint">Use the target delivery or completion date.</span>
            )}
          </label>
          <label className="form-field pr-form-wide">
            <span className="form-label">Workflow status</span>
            <select
              className={`form-input ${errors.status ? "form-input--error" : ""}`}
              value={input.status}
              onChange={(event) =>
                updateField("status", event.target.value as PurchaseRequestStatus)
              }
            >
              <option value="draft">Draft — still being prepared</option>
              <option value="open">Open — ready for RFQ preparation</option>
              {allowClosedStatus ? (
                <option value="closed">Closed — procurement work completed</option>
              ) : null}
            </select>
            {!allowClosedStatus ? (
              <span className="form-hint">
                Only Admins and Procurement Managers can close requests.
              </span>
            ) : null}
          </label>
        </div>
      </section>

      <section className="pr-form-section pr-items-section">
        <div className="pr-form-section__heading pr-form-section__heading--between">
          <span>03</span>
          <div>
            <h3>Requested items</h3>
            <p>
              {summary.lineCount} {summary.lineCount === 1 ? "line" : "lines"} ·{" "}
              {summary.totalQuantity.toLocaleString("en-PH")} total units
            </p>
          </div>
          <button
            className="button button--secondary"
            type="button"
            onClick={addItem}
            disabled={input.items.length >= 30}
          >
            <Icon name="plus" width={16} height={16} />
            Add item
          </button>
        </div>
        {errors.items ? (
          <div className="form-notice form-notice--error" role="alert">
            {errors.items}
          </div>
        ) : null}
        <div className="pr-items-list">
          {input.items.map((item, index) => (
            <article className="pr-item-editor" key={item.id}>
              <div className="pr-item-editor__index">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={input.items.length === 1}
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Icon name="close" width={16} height={16} />
                </button>
              </div>
              <div className="pr-item-grid">
                <label className="form-field pr-item-name">
                  <span className="form-label">Item or service</span>
                  <input
                    className={`form-input ${errors[`item.${index}.name`] ? "form-input--error" : ""}`}
                    value={item.name}
                    onChange={(event) => updateItem(index, "name", event.target.value)}
                    maxLength={140}
                    placeholder="Item name"
                  />
                  {errors[`item.${index}.name`] ? (
                    <span className="form-error">{errors[`item.${index}.name`]}</span>
                  ) : null}
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
                  {errors[`item.${index}.quantity`] ? (
                    <span className="form-error">{errors[`item.${index}.quantity`]}</span>
                  ) : null}
                </label>
                <label className="form-field">
                  <span className="form-label">Unit</span>
                  <input
                    className={`form-input ${errors[`item.${index}.unit`] ? "form-input--error" : ""}`}
                    value={item.unit}
                    onChange={(event) => updateItem(index, "unit", event.target.value)}
                    maxLength={30}
                    placeholder="piece, box, lot"
                  />
                  {errors[`item.${index}.unit`] ? (
                    <span className="form-error">{errors[`item.${index}.unit`]}</span>
                  ) : null}
                </label>
                <label className="form-field pr-item-spec">
                  <span className="form-label">
                    Specifications <small>Optional</small>
                  </span>
                  <textarea
                    className={`form-input form-textarea ${errors[`item.${index}.specifications`] ? "form-input--error" : ""}`}
                    value={item.specifications}
                    onChange={(event) => updateItem(index, "specifications", event.target.value)}
                    maxLength={600}
                    rows={3}
                    placeholder="Dimensions, material, compatibility, required standards, or scope details"
                  />
                  {errors[`item.${index}.specifications`] ? (
                    <span className="form-error">{errors[`item.${index}.specifications`]}</span>
                  ) : null}
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pr-form-section">
        <div className="pr-form-section__heading">
          <span>04</span>
          <div>
            <h3>Internal notes</h3>
            <p>Add context that should stay with the request.</p>
          </div>
        </div>
        <label className="form-field">
          <span className="form-label">
            Notes <small>Optional</small>
          </span>
          <textarea
            className={`form-input form-textarea ${errors.notes ? "form-input--error" : ""}`}
            value={input.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            maxLength={1200}
            rows={5}
            placeholder="Approvals already received, preferred procurement approach, or internal reminders"
          />
          <span className="form-hint">{input.notes.length}/1,200 characters</span>
          {errors.notes ? <span className="form-error">{errors.notes}</span> : null}
        </label>
      </section>

      <footer className="pr-form-actions">
        <button
          className="button button--secondary"
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button className="button button--accent" type="submit" disabled={saving}>
          {saving ? "Saving request…" : submitLabel}
        </button>
      </footer>
    </form>
  );
}
