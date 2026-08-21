import { Icon, type IconName } from "@/components/ui/icons";

export function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: IconName;
}) {
  return (
    <article className="metric-card">
      <div className="metric-card__header">
        <span>{label}</span>
        <span className="metric-icon"><Icon name={icon} width={18} height={18} /></span>
      </div>
      <strong className="metric-value">{value}</strong>
      <p>{helper}</p>
    </article>
  );
}
