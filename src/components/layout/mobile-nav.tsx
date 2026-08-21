"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavigation, secondaryNavigation } from "@/config/navigation";
import { Brand } from "@/components/layout/brand";
import { Icon } from "@/components/ui/icons";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = [...primaryNavigation, ...secondaryNavigation];

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
        </nav>
      ) : null}
    </div>
  );
}
