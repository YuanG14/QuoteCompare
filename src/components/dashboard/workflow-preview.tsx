import { Icon } from "@/components/ui/icons";
import { Panel } from "@/components/ui/panel";

const workflow = ["Request", "RFQ", "Quotes", "Review", "Compare", "Award"];

export function WorkflowPreview() {
  return (
    <Panel className="workflow-panel">
      <div className="panel-heading panel-heading--compact">
        <div>
          <p className="eyebrow">The process</p>
          <h2>From requirement to supplier award.</h2>
          <p className="panel-description">Every stage stays connected so the final decision has context, evidence, and an audit trail.</p>
        </div>
        <span className="workflow-security"><Icon name="shield" width={16} height={16} /> Human-controlled</span>
      </div>
      <div className="workflow-track" aria-label="Planned procurement workflow">
        {workflow.map((step, index) => (
          <div className="workflow-step" key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}
