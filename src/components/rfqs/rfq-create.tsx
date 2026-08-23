"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RfqForm, emptyRfqInput } from "@/components/rfqs/rfq-form";
import { getPurchaseRequestErrorMessage } from "@/lib/purchase-requests/errors";
import { listPurchaseRequests } from "@/lib/purchase-requests/service";
import { getRfqErrorMessage } from "@/lib/rfqs/errors";
import { createRfq } from "@/lib/rfqs/service";
import { listSuppliers } from "@/lib/suppliers/service";
import { useAuth } from "@/providers/auth-provider";
import { useOrganization } from "@/providers/organization-provider";
import type { PurchaseRequest } from "@/types/purchase-request";
import type { RfqInput } from "@/types/rfq";
import type { Supplier } from "@/types/supplier";

export function RfqCreate() {
  const router = useRouter();
  const { user } = useAuth();
  const { organization, can } = useOrganization();
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization) return;
    let active = true;
    const timer = window.setTimeout(() => {
      void Promise.all([listPurchaseRequests(organization.id), listSuppliers(organization.id)])
        .then(([requests, supplierRecords]) => {
          if (!active) return;
          setPurchaseRequests(
            requests.filter((request) => request.status === "open" && !request.archived),
          );
          setSuppliers(supplierRecords.filter((supplier) => supplier.status === "active"));
        })
        .catch((nextError) => {
          if (active) setError(getPurchaseRequestErrorMessage(nextError));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [organization]);

  async function handleCreate(input: RfqInput) {
    if (!organization || !user || !can("quotations.manage")) return;
    setSaving(true);
    setError(null);
    try {
      const id = await createRfq(organization.id, user.uid, input);
      router.push(`/rfqs/${id}`);
    } catch (nextError) {
      setError(getRfqErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }

  if (!can("quotations.manage"))
    return (
      <section className="pr-detail-state">
        <span className="state-label">RFQ access</span>
        <h1>Your role cannot build RFQs.</h1>
        <p>You can still review issued and closed RFQs in the organization register.</p>
        <Link className="button button--primary" href="/rfqs">
          Back to RFQs
        </Link>
      </section>
    );
  if (loading)
    return (
      <section className="pr-detail-state" aria-busy="true">
        <span className="state-label">RFQ builder</span>
        <h1>Preparing the source records.</h1>
        <p>Loading Open purchase requests and active suppliers from this organization.</p>
      </section>
    );

  return (
    <div className="page-stack rfq-builder-page">
      <Link className="text-link" href="/rfqs">
        ← Back to RFQs
      </Link>
      <header className="rfq-builder-header">
        <p className="eyebrow">New request for quotation</p>
        <h1>Build one clear brief for every supplier.</h1>
        <p className="page-subtitle">
          The original purchase request remains unchanged. This RFQ stores its own editable item and
          requirement snapshot for supplier outreach.
        </p>
      </header>
      {error ? (
        <div className="form-notice form-notice--error" role="alert">
          {error}
        </div>
      ) : null}
      {purchaseRequests.length === 0 ? (
        <div className="form-notice form-notice--warning">
          No Open purchase requests are available. Mark a purchase request Open before building an
          RFQ.
        </div>
      ) : null}
      {suppliers.length === 0 ? (
        <div className="form-notice form-notice--warning">
          No active suppliers are available. Add or reactivate a supplier before saving an RFQ.
        </div>
      ) : null}
      <RfqForm
        initialValue={emptyRfqInput()}
        purchaseRequests={purchaseRequests}
        suppliers={suppliers}
        saving={saving}
        submitLabel="Save RFQ draft"
        onSubmit={handleCreate}
        onCancel={() => router.push("/rfqs")}
      />
    </div>
  );
}
