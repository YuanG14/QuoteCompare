import Link from "next/link";
import { Brand } from "@/components/layout/brand";
import { Icon } from "@/components/ui/icons";

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Brand href="/" />
        <nav aria-label="Account navigation" className="landing-nav__actions">
          <Link className="button button--secondary" href="/signin">
            Sign in
          </Link>
          <Link className="button button--primary" href="/signup">
            Create account
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__copy">
          <p className="eyebrow">QuoteCompare / Phase 4</p>
          <h1>Know the suppliers behind every quotation.</h1>
          <p className="landing-lead">
            Build a clean, organization-secured vendor directory before comparisons begin. Supplier
            contacts, categories, and availability now stay in one reliable record.
          </p>
          <div className="landing-actions">
            <Link className="button button--accent" href="/signup">
              Create your account <Icon name="arrow" width={18} height={18} />
            </Link>
            <Link className="text-link text-link--large" href="/signin">
              I already have an account
            </Link>
          </div>
        </div>

        <aside className="landing-auth-card">
          <span className="landing-auth-card__index">04</span>
          <div>
            <p className="eyebrow eyebrow--on-dark">Supplier management</p>
            <h2>Clear records before quote requests.</h2>
          </div>
          <ul className="landing-checks">
            <li>
              <Icon name="check" width={18} height={18} /> Organization-scoped supplier records
            </li>
            <li>
              <Icon name="check" width={18} height={18} /> Search and status filtering
            </li>
            <li>
              <Icon name="check" width={18} height={18} /> Role-aware create and edit controls
            </li>
            <li>
              <Icon name="check" width={18} height={18} /> Firestore-enforced authorization
            </li>
          </ul>
        </aside>
      </section>

      <section className="landing-principles" aria-label="Phase 4 supplier principles">
        <article>
          <span>01</span>
          <h2>Clean identity.</h2>
          <p>
            Names, categories, and primary contacts remain consistent before quotations enter the
            system.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>History preserved.</h2>
          <p>
            Inactive suppliers stay in the directory so future procurement records do not lose
            context.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>Rules are the boundary.</h2>
          <p>
            The interface explains permissions, while Firestore rules independently enforce
            organization access.
          </p>
        </article>
      </section>
    </main>
  );
}
