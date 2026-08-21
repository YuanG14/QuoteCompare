import { Icon } from "@/components/ui/icons";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";

const steps = [
  { title: "Create your workspace", description: "The application foundation and navigation are ready.", complete: true },
  { title: "Connect Firebase", description: "Authentication and secure data access arrive in Phase 2.", complete: false },
  { title: "Add your first supplier", description: "Build the supplier directory before requesting quotations.", complete: false },
];

export function GettingStarted() {
  return (
    <Panel className="getting-started">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Workspace setup</p>
          <h2>Build the procurement foundation</h2>
          <p className="panel-description">A controlled setup path keeps configuration, security, and data clean from the beginning.</p>
        </div>
        <StatusBadge tone="info">1 of 3 complete</StatusBadge>
      </div>
      <div className="setup-list">
        {steps.map((step, index) => (
          <div className="setup-row" key={step.title}>
            <span className={`setup-step ${step.complete ? "setup-step--complete" : ""}`}>
              {step.complete ? <Icon name="check" width={16} height={16} /> : index + 1}
            </span>
            <div className="setup-row__copy">
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </div>
            <span className="setup-state">{step.complete ? "Done" : "Upcoming"}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
