"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadOrganizationContext } from "@/lib/organizations/service";
import { hasPermission, type WorkspacePermission } from "@/lib/organizations/permissions";
import { useAuth } from "@/providers/auth-provider";
import type { Organization, OrganizationMembership, WorkspaceUserProfile } from "@/types/organization";

export type OrganizationStatus = "idle" | "loading" | "ready" | "missing" | "error";

type OrganizationContextValue = {
  status: OrganizationStatus;
  profile: WorkspaceUserProfile | null;
  organization: Organization | null;
  membership: OrganizationMembership | null;
  error: string | null;
  refresh: () => Promise<void>;
  can: (permission: WorkspacePermission) => boolean;
};

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, status: authStatus } = useAuth();
  const [status, setStatus] = useState<OrganizationStatus>("idle");
  const [profile, setProfile] = useState<WorkspaceUserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMembership | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (authStatus !== "authenticated" || !user || !user.emailVerified) {
      setStatus("idle");
      setProfile(null);
      setOrganization(null);
      setMembership(null);
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const context = await loadOrganizationContext(user);
      if (!context) {
        setProfile(null);
        setOrganization(null);
        setMembership(null);
        setStatus("missing");
        return;
      }
      setProfile(context.profile);
      setOrganization(context.organization);
      setMembership(context.membership);
      setStatus("ready");
    } catch (nextError) {
      setProfile(null);
      setOrganization(null);
      setMembership(null);
      setError(nextError instanceof Error ? nextError.message : "Unable to load your organization workspace.");
      setStatus("error");
    }
  }, [authStatus, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<OrganizationContextValue>(
    () => ({
      status,
      profile,
      organization,
      membership,
      error,
      refresh,
      can: (permission) => hasPermission(membership?.role ?? null, permission),
    }),
    [status, profile, organization, membership, error, refresh],
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) throw new Error("useOrganization must be used inside OrganizationProvider.");
  return context;
}
