import Link from "next/link";
import { ActivityEmpty } from "@/components/dashboard/activity-empty";
import { GettingStarted } from "@/components/dashboard/getting-started";
import { MetricCard } from "@/components/dashboard/metric-card";
import { WorkflowPreview } from "@/components/dashboard/workflow-preview";
import { Icon } from "@/components/ui/icons";

export default function DashboardPage() {
  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Procurement overview</p>
          <h1>Keep every quotation decision clear.</h1>
          <p className="page-subtitle">QuoteCompare gives purchasing teams one structured place to move from request to supplier award.</p>
        </div>
        <Link href="/procurement" className="button button--primary">
          <Icon name="plus" width={18} height={18} />
          <span>Start procurement</span>
        </Link>
      </section>

      <section className="metric-grid" aria-label="Procurement summary">
        <MetricCard label="Active comparisons" value="0" helper="No comparisons in progress" icon="dashboard" />
        <MetricCard label="Pending reviews" value="0" helper="Nothing needs verification" icon="clock" />
        <MetricCard label="Suppliers" value="0" helper="Supplier directory is empty" icon="supplier" />
        <MetricCard label="Awarded decisions" value="0" helper="No supplier awards recorded" icon="award" />
      </section>

      <section className="dashboard-grid">
        <GettingStarted />
        <ActivityEmpty />
      </section>

      <WorkflowPreview />
    </div>
  );
}
