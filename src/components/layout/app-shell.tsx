import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <MobileNav />
      <div className="workspace-shell">
        <Topbar />
        <main className="workspace-main">{children}</main>
      </div>
    </div>
  );
}
