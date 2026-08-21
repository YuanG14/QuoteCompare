export default function Loading() {
  return (
    <div className="state-screen" aria-live="polite" aria-busy="true">
      <div className="state-card">
        <div className="skeleton skeleton--icon" />
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line skeleton--short" />
      </div>
    </div>
  );
}
