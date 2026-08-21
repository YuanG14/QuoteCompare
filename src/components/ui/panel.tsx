type PanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function Panel({ children, className = "" }: PanelProps) {
  return <section className={`panel ${className}`.trim()}>{children}</section>;
}
