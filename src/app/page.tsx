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
          <p className="eyebrow">QuoteCompare / Phase 6</p>
          <h1>Give every supplier the same clear brief.</h1>
          <p className="landing-lead">
            Turn an Open purchase request into a structured RFQ with consistent items, requirements,
            commercial expectations, deadlines, and a controlled supplier shortlist.
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
          <span className="landing-auth-card__index">06</span>
          <div>
            <p className="eyebrow eyebrow--on-dark">RFQ builder</p>
            <h2>One scope, shared consistently.</h2>
          </div>
          <ul className="landing-checks">
            <li>
              <Icon name="check" width={18} height={18} /> Purchase-request-linked RFQs
            </li>
            <li>
              <Icon name="check" width={18} height={18} /> Required and preferred criteria
            </li>
            <li>
              <Icon name="check" width={18} height={18} /> Draft, Issued, and Closed lifecycle
            </li>
            <li>
              <Icon name="check" width={18} height={18} /> Firestore-enforced authorization
            </li>
          </ul>
        </aside>
      </section>

      <section className="landing-principles" aria-label="Phase 6 RFQ principles">
        <article>
          <span>01</span>
          <h2>Source preserved.</h2>
          <p>The RFQ links to its purchase request without silently changing the original need.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Briefs stay consistent.</h2>
          <p>
            Every selected supplier receives the same items, criteria, deadline, and commercial
            expectations.
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
