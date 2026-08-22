import Link from "next/link";
import { ActivityEmpty } from "@/components/dashboard/activity-empty";
import { GettingStarted } from "@/components/dashboard/getting-started";
import { MetricCard } from "@/components/dashboard/metric-card";
import { WorkflowPreview } from "@/components/dashboard/workflow-preview";
import { Icon } from "@/components/ui/icons";

export default function DashboardPage() {
  return (
    <div className="page-stack">
      <section className="dashboard-hero">
        <div className="dashboard-hero__intro">
          <p className="eyebrow">Procurement workspace</p>
          <h1>Make every quote easier to compare.</h1>
        </div>
        <div className="dashboard-hero__aside">
          <p>
            Bring supplier quotations into one structured workspace, compare the details that
            matter, and keep the final decision human-controlled.
          </p>
          <Link href="/procurement" className="button button--accent">
            <Icon name="plus" width={18} height={18} />
            <span>Start procurement</span>
          </Link>
        </div>
      </section>

      <section className="decision-stage" aria-label="QuoteCompare workspace preview">
        <div className="decision-canvas">
          <div className="decision-canvas__topline">
            <span className="decision-canvas__label">Comparison workspace</span>
            <span className="decision-canvas__status">
              <span /> Ready for your first RFQ
            </span>
          </div>
          <div className="decision-canvas__body">
            <div className="decision-canvas__copy">
              <span className="display-number">01</span>
              <h2>One place for the numbers, terms, and trade-offs.</h2>
              <p>
                QuoteCompare will normalize supplier offers into a clear decision view instead of
                another spreadsheet you have to rebuild by hand.
              </p>
              <div className="decision-tags" aria-label="Planned comparison criteria">
                <span>Total cost</span>
                <span>Compliance</span>
                <span>Delivery</span>
                <span>Warranty</span>
              </div>
            </div>

            <div className="quote-preview" aria-label="Quotation comparison preview">
              <div className="quote-preview__header">
                <span>Supplier</span>
                <span>Total</span>
                <span>Fit</span>
              </div>
              <div className="quote-preview__row quote-preview__row--accent">
                <strong>Best-value supplier</strong>
                <span>—</span>
                <span className="quote-preview__pill">Pending</span>
              </div>
              <div className="quote-preview__row">
                <strong>Supplier 02</strong>
                <span>—</span>
                <span className="quote-preview__pill">Pending</span>
              </div>
              <div className="quote-preview__row">
                <strong>Supplier 03</strong>
                <span>—</span>
                <span className="quote-preview__pill">Pending</span>
              </div>
              <div className="quote-preview__footer">
                <Icon name="shield" width={16} height={16} />
                <span>No recommendation is made without reviewed data.</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="decision-principle">
          <span className="decision-principle__index">QC / 01</span>
          <p>
            The platform organizes the evidence. <em>You</em> make the final call.
          </p>
          <span className="decision-principle__rule" />
          <small>Human-controlled procurement decisions by design.</small>
        </aside>
      </section>

      <section className="metric-grid" aria-label="Procurement summary">
        <MetricCard
          label="Active comparisons"
          value="0"
          helper="No comparisons in progress"
          icon="dashboard"
        />
        <MetricCard
          label="Pending reviews"
          value="0"
          helper="Nothing needs verification"
          icon="clock"
        />
        <MetricCard
          label="Suppliers"
          value="0"
          helper="Supplier directory is empty"
          icon="supplier"
        />
        <MetricCard
          label="Awarded decisions"
          value="0"
          helper="No supplier awards recorded"
          icon="award"
        />
      </section>

      <section className="dashboard-grid">
        <GettingStarted />
        <ActivityEmpty />
      </section>

      <WorkflowPreview />
    </div>
  );
}
