export const ORGANIZATION_ROLES = [
  "admin",
  "procurement_manager",
  "procurement_staff",
  "viewer",
] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];
export type MembershipStatus = "active" | "suspended";

export type Organization = {
  id: string;
  name: string;
  normalizedName: string;
  createdBy: string;
};

export type OrganizationMembership = {
  organizationId: string;
  userId: string;
  email: string;
  displayName: string;
  role: OrganizationRole;
  status: MembershipStatus;
};

export type WorkspaceUserProfile = {
  uid: string;
  email: string;
  displayName: string;
  activeOrganizationId: string | null;
};
