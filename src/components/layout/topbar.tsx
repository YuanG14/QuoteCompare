import { Icon } from "@/components/ui/icons";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="search-shell" role="search">
        <Icon name="search" width={18} height={18} />
        <label className="sr-only" htmlFor="workspace-search">Search workspace</label>
        <input id="workspace-search" type="search" placeholder="Search procurement workspace" disabled />
        <kbd>⌘ K</kbd>
      </div>
      <div className="topbar-actions">
        <span className="foundation-pill"><span className="foundation-dot" /> Foundation ready</span>
        <button className="profile-button" type="button" aria-label="Open account menu" disabled>
          <span className="profile-avatar">QC</span>
          <span className="profile-copy"><strong>Workspace Admin</strong><small>Phase 1 preview</small></span>
        </button>
      </div>
    </header>
  );
}
