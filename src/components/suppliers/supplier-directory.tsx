"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icons";
import { getSupplierErrorMessage } from "@/lib/suppliers/errors";
import {
  createSupplier,
  listSuppliers,
  setSupplierStatus,
  updateSupplier,
} from "@/lib/suppliers/service";
import {
  hasSupplierErrors,
  validateSupplier,
  type SupplierFieldErrors,
} from "@/lib/suppliers/validation";
import { useAuth } from "@/providers/auth-provider";
import { useOrganization } from "@/providers/organization-provider";
import type { Supplier, SupplierInput, SupplierStatus } from "@/types/supplier";

const emptyInput: SupplierInput = {
  name: "",
  category: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  status: "active",
};

const categories = [
  "Construction",
  "Facilities",
  "Information technology",
  "Office supplies",
  "Professional services",
  "Transport and logistics",
];

function formatDate(value: Date | null): string {
  return value
    ? new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(
        value,
      )
    : "Just now";
}

function supplierInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "SU"
  );
}

export function SupplierDirectory() {
  const { user } = useAuth();
  const { organization, can } = useOrganization();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SupplierStatus>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [input, setInput] = useState<SupplierInput>(emptyInput);
  const [fieldErrors, setFieldErrors] = useState<SupplierFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setError(null);
    try {
      setSuppliers(await listSuppliers(organization.id));
    } catch (nextError) {
      setError(getSupplierErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!editorOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) setEditorOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [editorOpen, saving]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      const matchesStatus = statusFilter === "all" || supplier.status === statusFilter;
      const matchesSearch =
        !needle ||
        [supplier.name, supplier.category, supplier.contactName, supplier.email].some((value) =>
          value.toLowerCase().includes(needle),
        );
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, suppliers]);

  const activeCount = suppliers.filter((supplier) => supplier.status === "active").length;
  const categoryCount = new Set(
    suppliers.map((supplier) => supplier.category.toLowerCase()).filter(Boolean),
  ).size;

  function openCreate() {
    setEditing(null);
    setInput(emptyInput);
    setFieldErrors({});
    setError(null);
    setMessage(null);
    setEditorOpen(true);
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier);
    setInput({
      name: supplier.name,
      category: supplier.category,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      notes: supplier.notes,
      status: supplier.status,
    });
    setFieldErrors({});
    setError(null);
    setMessage(null);
    setEditorOpen(true);
  }

  function updateField<K extends keyof SupplierInput>(field: K, value: SupplierInput[K]) {
    setInput((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization || !user || !can("suppliers.manage")) return;
    const errors = validateSupplier(input);
    setFieldErrors(errors);
    if (hasSupplierErrors(errors)) return;

    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateSupplier(organization.id, editing.id, user.uid, input);
        setMessage(`${input.name.trim()} was updated.`);
      } else {
        await createSupplier(organization.id, user.uid, input);
        setMessage(`${input.name.trim()} was added to the directory.`);
      }
      setEditorOpen(false);
      await load();
    } catch (nextError) {
      setError(getSupplierErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(supplier: Supplier) {
    if (!organization || !user || !can("suppliers.manage")) return;
    const nextStatus: SupplierStatus = supplier.status === "active" ? "inactive" : "active";
    setError(null);
    setMessage(null);
    try {
      await setSupplierStatus(organization.id, supplier.id, user.uid, nextStatus);
      setMessage(`${supplier.name} is now ${nextStatus}.`);
      await load();
    } catch (nextError) {
      setError(getSupplierErrorMessage(nextError));
    }
  }

  if (!organization) return null;

  return (
    <div className="page-stack supplier-page">
      <header className="supplier-header">
        <div>
          <p className="eyebrow">Supplier management · Phase 4</p>
          <h1>Your trusted supplier directory.</h1>
          <p className="page-subtitle">
            Keep vendor identity and contact details organized inside {organization.name}. Every
            record stays inside your organization boundary.
          </p>
        </div>
        {can("suppliers.manage") ? (
          <button className="button button--accent" type="button" onClick={openCreate}>
            <Icon name="plus" width={18} height={18} />
            Add supplier
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
      {message ? (
        <div className="form-notice form-notice--success" role="status">
          {message}
        </div>
      ) : null}

      <section className="supplier-ledger" aria-label="Supplier summary">
        <article>
          <span>Directory total</span>
          <strong>{suppliers.length}</strong>
          <small>supplier records</small>
        </article>
        <article>
          <span>Available for RFQs</span>
          <strong>{activeCount}</strong>
          <small>active suppliers</small>
        </article>
        <article>
          <span>Coverage</span>
          <strong>{categoryCount}</strong>
          <small>{categoryCount === 1 ? "category" : "categories"}</small>
        </article>
        <aside>
          <span>QC / SUPPLIERS</span>
          <p>Good comparisons begin with clean supplier records.</p>
        </aside>
      </section>

      <section className="supplier-directory" aria-labelledby="supplier-directory-title">
        <div className="supplier-directory__heading">
          <div>
            <p className="eyebrow">Directory</p>
            <h2 id="supplier-directory-title">Supplier records</h2>
          </div>
          <span>
            {loading ? "Loading records…" : `${filtered.length} of ${suppliers.length} shown`}
          </span>
        </div>

        <div className="supplier-toolbar">
          <label className="supplier-search">
            <Icon name="search" width={18} height={18} />
            <span className="sr-only">Search suppliers</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, category, contact, or email"
            />
          </label>
          <label className="supplier-filter">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | SupplierStatus)}
            >
              <option value="all">All suppliers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="supplier-loading" aria-busy="true">
            {[1, 2, 3].map((item) => (
              <span key={item} className="supplier-loading__row" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="supplier-empty">
            <span className="supplier-empty__index">00 / NO RECORDS</span>
            <h3>
              {suppliers.length === 0
                ? "Build your supplier shortlist."
                : "No suppliers match this view."}
            </h3>
            <p>
              {suppliers.length === 0
                ? "Add the vendors you regularly request quotations from. You can update their details or mark them inactive later."
                : "Clear the search or change the status filter to see other records."}
            </p>
            {suppliers.length === 0 && can("suppliers.manage") ? (
              <button className="text-link" type="button" onClick={openCreate}>
                Add the first supplier <Icon name="arrow" width={16} height={16} />
              </button>
            ) : null}
          </div>
        ) : (
          <div className="supplier-table-shell">
            <table className="supplier-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Primary contact</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <div className="supplier-identity">
                        <span>{supplierInitials(supplier.name)}</span>
                        <div>
                          <strong>{supplier.name}</strong>
                          <small>
                            {supplier.category || "Uncategorized"} · ID{" "}
                            {supplier.id.slice(0, 6).toUpperCase()}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="supplier-contact">
                        <strong>{supplier.contactName || "No contact named"}</strong>
                        {supplier.email ? (
                          <a href={`mailto:${supplier.email}`}>{supplier.email}</a>
                        ) : (
                          <small>No email recorded</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`supplier-status supplier-status--${supplier.status}`}>
                        <i />
                        {supplier.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="supplier-date">{formatDate(supplier.updatedAt)}</td>
                    <td>
                      <div className="supplier-row-actions">
                        {can("suppliers.manage") ? (
                          <>
                            <button type="button" onClick={() => openEdit(supplier)}>
                              Edit
                            </button>
                            <button type="button" onClick={() => void toggleStatus(supplier)}>
                              {supplier.status === "active" ? "Deactivate" : "Reactivate"}
                            </button>
                          </>
                        ) : (
                          <span>View only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editorOpen ? (
        <div
          className="supplier-editor-layer"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setEditorOpen(false);
          }}
        >
          <aside
            className="supplier-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="supplier-editor-title"
          >
            <header>
              <div>
                <p className="eyebrow">{editing ? "Edit record" : "New record"}</p>
                <h2 id="supplier-editor-title">{editing ? editing.name : "Add a supplier"}</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close supplier editor"
                onClick={() => setEditorOpen(false)}
                disabled={saving}
              >
                <Icon name="close" />
              </button>
            </header>
            <form onSubmit={handleSubmit} noValidate>
              <div className="supplier-form-grid">
                <label className="form-field supplier-form-wide">
                  <span className="form-label">Supplier name</span>
                  <input
                    className={`form-input ${fieldErrors.name ? "form-input--error" : ""}`}
                    value={input.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    maxLength={120}
                    autoFocus
                    placeholder="e.g. Northline Office Systems"
                  />
                  {fieldErrors.name ? <span className="form-error">{fieldErrors.name}</span> : null}
                </label>
                <label className="form-field">
                  <span className="form-label">Category</span>
                  <input
                    className={`form-input ${fieldErrors.category ? "form-input--error" : ""}`}
                    list="supplier-categories"
                    value={input.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    maxLength={80}
                    placeholder="Choose or type a category"
                  />
                  <datalist id="supplier-categories">
                    {categories.map((category) => (
                      <option value={category} key={category} />
                    ))}
                  </datalist>
                  {fieldErrors.category ? (
                    <span className="form-error">{fieldErrors.category}</span>
                  ) : null}
                </label>
                <label className="form-field">
                  <span className="form-label">Status</span>
                  <select
                    className="form-input"
                    value={input.status}
                    onChange={(event) =>
                      updateField("status", event.target.value as SupplierStatus)
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                <label className="form-field">
                  <span className="form-label">
                    Contact name <small>Optional</small>
                  </span>
                  <input
                    className={`form-input ${fieldErrors.contactName ? "form-input--error" : ""}`}
                    value={input.contactName}
                    onChange={(event) => updateField("contactName", event.target.value)}
                    maxLength={80}
                    placeholder="Primary representative"
                  />
                  {fieldErrors.contactName ? (
                    <span className="form-error">{fieldErrors.contactName}</span>
                  ) : null}
                </label>
                <label className="form-field">
                  <span className="form-label">
                    Email <small>Optional</small>
                  </span>
                  <input
                    className={`form-input ${fieldErrors.email ? "form-input--error" : ""}`}
                    type="email"
                    value={input.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    maxLength={160}
                    placeholder="purchasing@supplier.com"
                  />
                  {fieldErrors.email ? (
                    <span className="form-error">{fieldErrors.email}</span>
                  ) : null}
                </label>
                <label className="form-field supplier-form-wide">
                  <span className="form-label">
                    Phone <small>Optional</small>
                  </span>
                  <input
                    className={`form-input ${fieldErrors.phone ? "form-input--error" : ""}`}
                    type="tel"
                    value={input.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    maxLength={30}
                    placeholder="+63 917 123 4567"
                  />
                  {fieldErrors.phone ? (
                    <span className="form-error">{fieldErrors.phone}</span>
                  ) : null}
                </label>
                <label className="form-field supplier-form-wide">
                  <span className="form-label">
                    Address <small>Optional</small>
                  </span>
                  <textarea
                    className={`form-input form-textarea ${fieldErrors.address ? "form-input--error" : ""}`}
                    value={input.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    maxLength={240}
                    rows={3}
                    placeholder="Business address"
                  />
                  {fieldErrors.address ? (
                    <span className="form-error">{fieldErrors.address}</span>
                  ) : null}
                </label>
                <label className="form-field supplier-form-wide">
                  <span className="form-label">
                    Internal notes <small>Optional</small>
                  </span>
                  <textarea
                    className={`form-input form-textarea ${fieldErrors.notes ? "form-input--error" : ""}`}
                    value={input.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    maxLength={600}
                    rows={4}
                    placeholder="Payment terms, product coverage, or context your team should know"
                  />
                  <span className="form-hint">{input.notes.length}/600 characters</span>
                  {fieldErrors.notes ? (
                    <span className="form-error">{fieldErrors.notes}</span>
                  ) : null}
                </label>
              </div>
              <footer>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button className="button button--accent" type="submit" disabled={saving}>
                  {saving ? "Saving record…" : editing ? "Save changes" : "Add supplier"}
                </button>
              </footer>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
