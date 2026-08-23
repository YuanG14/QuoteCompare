import type { OrganizationRole } from "@/types/organization";

export const ORGANIZATION_ROLE_LABELS: Record<OrganizationRole, string> = {
  admin: "Admin",
  procurement_manager: "Procurement Manager",
  procurement_staff: "Procurement Staff",
  viewer: "Viewer",
};

export type WorkspacePermission =
  | "organization.manage"
  | "members.manage"
  | "procurement.create"
  | "procurement.close"
  | "quotations.manage"
  | "suppliers.manage"
  | "awards.approve"
  | "reports.view";

const rolePermissions: Record<OrganizationRole, readonly WorkspacePermission[]> = {
  admin: [
    "organization.manage",
    "members.manage",
    "procurement.create",
    "procurement.close",
    "quotations.manage",
    "suppliers.manage",
    "awards.approve",
    "reports.view",
  ],
  procurement_manager: [
    "procurement.create",
    "procurement.close",
    "quotations.manage",
    "suppliers.manage",
    "awards.approve",
    "reports.view",
  ],
  procurement_staff: [
    "procurement.create",
    "quotations.manage",
    "suppliers.manage",
    "reports.view",
  ],
  viewer: ["reports.view"],
};

export function hasPermission(
  role: OrganizationRole | null,
  permission: WorkspacePermission,
): boolean {
  return role ? rolePermissions[role].includes(permission) : false;
}

export function getRolePermissions(role: OrganizationRole): readonly WorkspacePermission[] {
  return rolePermissions[role];
}
