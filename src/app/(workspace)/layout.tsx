import type { ReactNode } from "react";
import { ProtectedWorkspace } from "@/components/auth/protected-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { OrganizationGate } from "@/components/organization/organization-gate";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedWorkspace>
      <OrganizationGate>
        <AppShell>{children}</AppShell>
      </OrganizationGate>
    </ProtectedWorkspace>
  );
}
