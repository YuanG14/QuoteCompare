import { Icon } from "@/components/ui/icons";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";

const steps = [
  { title: "Application foundation", description: "Core architecture, navigation, and design language are in place.", complete: true },
  { title: "Connect Firebase", description: "Email/password authentication, verification, recovery, and protected routes are active.", complete: true },
  { title: "Build your organization security model", description: "Organization membership, roles, Firestore rules, and Storage rules arrive in Phase 3.", complete: false },
];

export function GettingStarted() {
  return (
    <Panel className="getting-started">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Workspace setup</p>
          <h2>Set up the system in the right order.</h2>
          <p className="panel-description">A controlled setup path keeps permissions, procurement data, and future automation clean from the beginning.</p>
        </div>
        <StatusBadge tone="info">2 of 3 complete</StatusBadge>
      </div>
      <div className="setup-list">
        {steps.map((step, index) => (
          <div className="setup-row" key={step.title}>
            <span className={`setup-step ${step.complete ? "setup-step--complete" : ""}`}>
              {step.complete ? <Icon name="check" width={16} height={16} /> : String(index + 1).padStart(2, "0")}
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
