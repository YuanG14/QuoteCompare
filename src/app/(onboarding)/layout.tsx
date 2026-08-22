import type { ReactNode } from "react";
import { ProtectedWorkspace } from "@/components/auth/protected-workspace";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <ProtectedWorkspace>{children}</ProtectedWorkspace>;
}
