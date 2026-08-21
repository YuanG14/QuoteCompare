"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigation, secondaryNavigation } from "@/config/navigation";
import { Brand } from "@/components/layout/brand";
import { Icon } from "@/components/ui/icons";

export function Sidebar() {
  const pathname = usePathname();

  const renderItem = (item: (typeof primaryNavigation)[number]) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
      <Link
        href={item.href}
        key={item.href}
        className={`nav-link ${active ? "nav-link--active" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        <Icon name={item.icon} width={19} height={19} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Brand />
      </div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        <span className="nav-section-label">Workspace</span>
        <div className="nav-stack">{primaryNavigation.map(renderItem)}</div>
      </nav>
      <div className="sidebar-footer">
        <div className="nav-stack">{secondaryNavigation.map(renderItem)}</div>
        <div className="workspace-card">
          <span className="workspace-avatar" aria-hidden="true">QC</span>
          <span className="workspace-card__copy">
            <strong>QuoteCompare</strong>
            <small>Starter workspace</small>
          </span>
        </div>
      </div>
    </aside>
  );
}
