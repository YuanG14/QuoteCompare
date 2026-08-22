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
          <p className="eyebrow">QuoteCompare / Phase 2</p>
          <h1>Procurement decisions start with trusted access.</h1>
          <p className="landing-lead">Firebase Authentication now protects the QuoteCompare workspace before supplier data, files, roles, and approvals are introduced.</p>
          <div className="landing-actions">
            <Link className="button button--accent" href="/signup">Create your account <Icon name="arrow" width={18} height={18} /></Link>
            <Link className="text-link text-link--large" href="/signin">I already have an account</Link>
          </div>
        </div>

        <aside className="landing-auth-card">
          <span className="landing-auth-card__index">02</span>
          <div>
            <p className="eyebrow eyebrow--on-dark">Authentication foundation</p>
            <h2>Email, password, verification, recovery.</h2>
          </div>
          <ul className="landing-checks">
            <li><Icon name="check" width={18} height={18} /> Protected workspace routes</li>
            <li><Icon name="check" width={18} height={18} /> Persistent or session-only sign in</li>
            <li><Icon name="check" width={18} height={18} /> Verified-email gate</li>
            <li><Icon name="check" width={18} height={18} /> Password reset flow</li>
          </ul>
        </aside>
      </section>

      <section className="landing-principles" aria-label="Phase 2 security principles">
        <article><span>01</span><h2>Identity first.</h2><p>Every future procurement record can be tied to an authenticated Firebase user.</p></article>
        <article><span>02</span><h2>Readable states.</h2><p>Loading, configuration, validation, and authentication failures use custom application states.</p></article>
        <article><span>03</span><h2>Authorization next.</h2><p>Organization membership, roles, Firestore rules, and Storage rules remain Phase 3 concerns.</p></article>
      </section>
    </main>
  );
}
