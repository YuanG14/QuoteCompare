import Link from "next/link";

type BrandProps = {
  href?: string;
};

export function Brand({ href = "/dashboard" }: BrandProps) {
  return (
    <Link className="brand" href={href} aria-label="QuoteCompare home">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-mark__ring" />
        <span className="brand-mark__dot" />
      </span>
      <span className="brand-copy">
        <strong>QuoteCompare</strong>
        <small>Procurement workspace</small>
      </span>
    </Link>
  );
}
