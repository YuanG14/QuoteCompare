import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/dashboard" aria-label="QuoteCompare home">
      <span className="brand-mark" aria-hidden="true">
        <span>Q</span>
      </span>
      <span className="brand-copy">
        <strong>QuoteCompare</strong>
        <small>Procurement workspace</small>
      </span>
    </Link>
  );
}
