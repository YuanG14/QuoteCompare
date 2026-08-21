import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icons";

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  icon,
  phase,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: IconName;
  phase: string;
}) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon" aria-hidden="true">
        <Icon name={icon} width={24} height={24} />
      </div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="placeholder-copy">{description}</p>
      <span className="phase-chip">Planned for {phase}</span>
      <Link href="/dashboard" className="text-link">
        Return to overview <Icon name="arrow" width={16} height={16} />
      </Link>
    </div>
  );
}
