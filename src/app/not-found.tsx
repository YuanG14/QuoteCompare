import Link from "next/link";

export default function NotFound() {
  return (
    <div className="state-screen">
      <div className="state-card">
        <span className="state-label">404</span>
        <h1>This procurement view does not exist.</h1>
        <p>The link may be outdated or the page may not have been built yet.</p>
        <Link className="button button--primary" href="/dashboard">Return to overview</Link>
      </div>
    </div>
  );
}
