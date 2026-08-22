import Link from "next/link";
import { Brand } from "@/components/layout/brand";
import { Icon } from "@/components/ui/icons";

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Brand href="/" />
        <nav aria-label="Account navigation" className="landing-nav__actions">
          <Link className="button button--secondary" href="/signin">Sign in</Link>
          <Link className="button button--primary" href="/signup">Create account</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__copy">
          <p className="eyebrow">QuoteCompare / Phase 3</p>
          <h1>Secure the workspace before the procurement work begins.</h1>
          <p className="landing-lead">Firebase Authentication, organization membership, role permissions, and rules-backed data boundaries now form the secure base for every procurement feature that follows.</p>
          <div className="landing-actions">
            <Link className="button button--accent" href="/signup">Create your account <Icon name="arrow" width={18} height={18} /></Link>
            <Link className="text-link text-link--large" href="/signin">I already have an account</Link>
          </div>
        </div>

        <aside className="landing-auth-card">
          <span className="landing-auth-card__index">03</span>
          <div>
            <p className="eyebrow eyebrow--on-dark">Organization security</p>
            <h2>Identity, membership, roles, rules.</h2>
          </div>
          <ul className="landing-checks">
            <li><Icon name="check" width={18} height={18} /> Organization-scoped Firestore data</li>
            <li><Icon name="check" width={18} height={18} /> Four procurement access roles</li>
            <li><Icon name="check" width={18} height={18} /> Rules-backed authorization</li>
            <li><Icon name="check" width={18} height={18} /> Protected quotation file paths</li>
          </ul>
        </aside>
      </section>

      <section className="landing-principles" aria-label="Phase 3 security principles">
        <article><span>01</span><h2>Identity first.</h2><p>Every procurement record can be tied to an authenticated, verified Firebase user.</p></article>
        <article><span>02</span><h2>Organization-scoped.</h2><p>Workspace records sit behind an organization membership boundary instead of a shared global collection.</p></article>
        <article><span>03</span><h2>Rules are the boundary.</h2><p>The interface explains permissions, but Firestore and Storage rules enforce them independently.</p></article>
      </section>
    </main>
  );
}
