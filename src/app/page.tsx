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
          <p className="eyebrow">QuoteCompare / Phase 5</p>
          <h1>Define the need before asking for prices.</h1>
          <p className="landing-lead">
            Create clear internal purchase requests with the purpose, budget, timing, items,
            quantities, and specifications suppliers will eventually quote against.
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
          <span className="landing-auth-card__index">05</span>
          <div>
            <p className="eyebrow eyebrow--on-dark">Purchase requests</p>
            <h2>A controlled start for procurement work.</h2>
          </div>
          <ul className="landing-checks">
            <li>
              <Icon name="check" width={18} height={18} /> Organization-scoped purchase requests
            </li>
            <li>
              <Icon name="check" width={18} height={18} /> Multi-item requirements and
              specifications
            </li>
            <li>
              <Icon name="check" width={18} height={18} /> Draft, Open, Closed, and archive
              workflows
            </li>
            <li>
              <Icon name="check" width={18} height={18} /> Firestore-enforced authorization
            </li>
          </ul>
        </aside>
      </section>

      <section className="landing-principles" aria-label="Phase 5 purchase request principles">
        <article>
          <span>01</span>
          <h2>Purpose first.</h2>
          <p>
            Every procurement activity begins with a documented internal need and accountable
            requester.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>Requirements structured.</h2>
          <p>
            Quantities, units, specifications, budget, and timing stay attached to the same request.
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
