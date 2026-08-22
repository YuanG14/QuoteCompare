"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { primaryNavigation, secondaryNavigation } from "@/config/navigation";
import { Brand } from "@/components/layout/brand";
import { Icon } from "@/components/ui/icons";
import { signOutCurrentUser } from "@/lib/auth/service";
import { ORGANIZATION_ROLE_LABELS } from "@/lib/organizations/permissions";
import { useAuth } from "@/providers/auth-provider";
import { useOrganization } from "@/providers/organization-provider";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { organization, membership } = useOrganization();
  const items = [...primaryNavigation, ...secondaryNavigation];

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOutCurrentUser();
      setOpen(false);
      router.replace("/signin");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="mobile-nav">
      <div className="mobile-nav__bar">
        <Brand />
        <button
          className="icon-button"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open ? (
        <nav className="mobile-nav__menu" aria-label="Mobile navigation">
          {organization && membership ? (
            <div className="mobile-workspace-summary">
              <strong>{organization.name}</strong>
              <span>{ORGANIZATION_ROLE_LABELS[membership.role]}</span>
            </div>
          ) : null}
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? "nav-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Icon name={item.icon} width={19} height={19} />
                {item.label}
              </Link>
            );
          })}
          <div className="mobile-account">
            <div>
              <strong>{user?.displayName || "Workspace member"}</strong>
              <span>{user?.email}</span>
            </div>
            <button type="button" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
