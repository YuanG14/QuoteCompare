import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { Panel } from "@/components/ui/panel";

export function ActivityEmpty() {
  return (
    <Panel className="activity-panel">
      <div className="panel-heading panel-heading--compact">
        <div>
          <p className="eyebrow">Procurement activity</p>
          <h2>Nothing to review yet</h2>
        </div>
      </div>
      <div className="empty-state">
        <span className="empty-state__icon"><Icon name="quotation" width={24} height={24} /></span>
        <h3>Your comparison queue is clear</h3>
        <p>Once purchase requests and supplier quotations are added, the latest work will appear here.</p>
        <Link className="text-link" href="/procurement">
          View procurement area <Icon name="arrow" width={16} height={16} />
        </Link>
      </div>
    </Panel>
  );
}
