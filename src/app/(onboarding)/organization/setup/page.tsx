import { OrganizationSetupForm } from "@/components/organization/organization-setup-form";
import { Icon } from "@/components/ui/icons";

const safeguards = [
  "Organization-scoped Firestore documents",
  "Admin, manager, staff, and viewer roles",
  "Rules-enforced access independent of the UI",
];

export default function OrganizationSetupPage() {
  return (
    <main className="organization-onboarding">
      <section className="organization-onboarding__story">
        <div>
          <p className="eyebrow eyebrow--on-dark">QuoteCompare / Access model</p>
          <h1>Give procurement data a clear security boundary.</h1>
        </div>
        <div>
          <p className="organization-onboarding__lead">Every supplier, quotation, comparison, and award will belong to an organization—not to a shared global pool.</p>
          <ul className="organization-onboarding__checks">
            {safeguards.map((safeguard) => <li key={safeguard}><Icon name="check" width={18} height={18} /><span>{safeguard}</span></li>)}
          </ul>
        </div>
      </section>
      <section className="organization-onboarding__panel">
        <div className="organization-onboarding__heading">
          <p className="eyebrow">Organization setup</p>
          <h2>Create your workspace.</h2>
          <p>Start with the organization that owns the procurement records. You can manage its identity and review role permissions in Settings.</p>
        </div>
        <OrganizationSetupForm />
      </section>
    </main>
  );
}
