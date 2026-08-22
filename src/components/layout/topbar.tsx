"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icons";
import { signOutCurrentUser } from "@/lib/auth/service";
import { ORGANIZATION_ROLE_LABELS } from "@/lib/organizations/permissions";
import { useAuth } from "@/providers/auth-provider";
import { useOrganization } from "@/providers/organization-provider";

function getInitials(name: string | null, email: string | null): string {
  const source = name?.trim() || email?.split("@")[0] || "QC";
  return (
    source
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "QC"
  );
}

export function Topbar() {
  const router = useRouter();
  const { user } = useAuth();
  const { organization, membership } = useOrganization();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const displayName = user?.displayName || "Workspace member";

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOutCurrentUser();
      router.replace("/signin");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="topbar">
      <div className="search-shell" role="search">
        <Icon name="search" width={18} height={18} />
        <label className="sr-only" htmlFor="workspace-search">
          Search workspace
        </label>
        <input
          id="workspace-search"
          type="search"
          placeholder="Search procurement workspace"
          disabled
        />
        <kbd>⌘ K</kbd>
      </div>
      <div className="topbar-actions">
        <span className="foundation-pill">
          <span className="foundation-dot" /> Organization secured
        </span>
        <div className="profile-menu">
          <button
            className="profile-button"
            type="button"
            aria-label="Open account menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className="profile-avatar">
              {getInitials(user?.displayName ?? null, user?.email ?? null)}
            </span>
            <span className="profile-copy">
              <strong>{displayName}</strong>
              <small>
                {membership
                  ? ORGANIZATION_ROLE_LABELS[membership.role]
                  : (user?.email ?? "Authenticated account")}
              </small>
            </span>
          </button>
          {menuOpen ? (
            <div className="profile-popover" role="menu">
              <div className="profile-popover__identity">
                <strong>{displayName}</strong>
                <span>{user?.email}</span>
                <span className="verified-label">Verified email</span>
                {organization && membership ? (
                  <span className="profile-organization">
                    {organization.name} · {ORGANIZATION_ROLE_LABELS[membership.role]}
                  </span>
                ) : null}
              </div>
              <button type="button" role="menuitem" onClick={handleSignOut} disabled={signingOut}>
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
