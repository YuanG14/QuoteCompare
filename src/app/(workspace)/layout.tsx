import type { ReactNode } from "react";
import { ProtectedWorkspace } from "@/components/auth/protected-workspace";
import { AppShell } from "@/components/layout/app-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedWorkspace>
      <AppShell>{children}</AppShell>
    </ProtectedWorkspace>
  );
}
