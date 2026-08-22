"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icons";
import { getOrganizationErrorMessage } from "@/lib/organizations/errors";
import { ORGANIZATION_ROLE_LABELS, getRolePermissions } from "@/lib/organizations/permissions";
import { listOrganizationMembers, renameOrganization } from "@/lib/organizations/service";
import { validateOrganizationName } from "@/lib/organizations/validation";
import { useOrganization } from "@/providers/organization-provider";
import type { OrganizationMembership, OrganizationRole } from "@/types/organization";

const roles: OrganizationRole[] = ["admin", "procurement_manager", "procurement_staff", "viewer"];
const permissionRows = [
  ["Manage organization", "organization.manage"],
  ["Manage members", "members.manage"],
  ["Create procurement work", "procurement.create"],
  ["Manage quotations", "quotations.manage"],
  ["Manage suppliers", "suppliers.manage"],
  ["Approve supplier awards", "awards.approve"],
  ["View reports", "reports.view"],
] as const;

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "QC"
  );
}

export function OrganizationSettings() {
  const { organization, membership, can, refresh } = useOrganization();
  const [name, setName] = useState(organization?.name ?? "");
  const [members, setMembers] = useState<OrganizationMembership[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setName(organization?.name ?? ""), 0);
    return () => window.clearTimeout(timer);
  }, [organization?.name]);

  useEffect(() => {
    if (!organization) return;
    let active = true;
    const timer = window.setTimeout(() => setLoadingMembers(true), 0);
    void listOrganizationMembers(organization.id)
      .then((nextMembers) => {
        if (active) setMembers(nextMembers);
      })
      .catch((nextError) => {
        if (active) setError(getOrganizationErrorMessage(nextError));
      })
      .finally(() => {
        if (active) setLoadingMembers(false);
      });
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [organization]);

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization || !can("organization.manage")) return;
    const validation = validateOrganizationName(name);
    if (!validation.valid) {
      setError(validation.message);
      setMessage(null);
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await renameOrganization(organization.id, name);
      await refresh();
      setMessage("Organization name updated.");
    } catch (nextError) {
      setError(getOrganizationErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }

  if (!organization || !membership) return null;

  return (
    <div className="page-stack organization-settings-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace security</p>
          <h1>Organization settings</h1>
          <p className="page-subtitle">
            Review the workspace identity, your role, current members, and the permission model
            enforced around procurement data.
          </p>
        </div>
        <span className="role-pill role-pill--accent">
          <Icon name="shield" width={16} height={16} />
          {ORGANIZATION_ROLE_LABELS[membership.role]}
        </span>
      </header>

      {error ? (
        <div className="form-notice form-notice--error" role="alert">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="form-notice form-notice--success" role="status">
          {message}
        </div>
      ) : null}

      <section className="organization-settings-grid">
        <article className="organization-card organization-card--identity">
          <div className="organization-card__heading">
            <div>
              <p className="eyebrow">Workspace identity</p>
              <h2>{organization.name}</h2>
            </div>
            <span className="organization-id">ID {organization.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <p className="organization-card__description">
            This organization boundary is used by Firestore rules when deciding who can access
            procurement records.
          </p>
          <form className="organization-rename-form" onSubmit={handleRename}>
            <div className="form-field">
              <label className="form-label" htmlFor="settings-organization-name">
                Organization name
              </label>
              <input
                className="form-input"
                id="settings-organization-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={!can("organization.manage") || saving}
                maxLength={80}
              />
            </div>
            <button
              className="button button--primary"
              type="submit"
              disabled={!can("organization.manage") || saving || name.trim() === organization.name}
            >
              {saving ? "Saving…" : "Save workspace name"}
            </button>
          </form>
          {!can("organization.manage") ? (
            <p className="permission-note">
              <Icon name="shield" width={16} height={16} />
              Only an Admin can change organization identity.
            </p>
          ) : null}
        </article>

        <aside className="organization-card organization-card--role">
          <p className="eyebrow eyebrow--on-dark">Your access</p>
          <span className="role-card__index">
            ROLE / {String(roles.indexOf(membership.role) + 1).padStart(2, "0")}
          </span>
          <h2>{ORGANIZATION_ROLE_LABELS[membership.role]}</h2>
          <p>
            Your role is read from the organization membership document. UI controls use it for
            clarity; Firebase rules remain the real authorization boundary.
          </p>
          <div className="role-card__permissions">
            {getRolePermissions(membership.role).map((permission) => (
              <span key={permission}>
                <Icon name="check" width={15} height={15} />
                {permission.replace(".", " · ")}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section className="organization-card">
        <div className="organization-card__heading organization-card__heading--members">
          <div>
            <p className="eyebrow">Membership</p>
            <h2>People with workspace access.</h2>
            <p className="organization-card__description">
              Phase 3 establishes the secure membership model. A dedicated invitation flow can build
              on these same membership documents later.
            </p>
          </div>
          <span className="member-count">
            {loadingMembers
              ? "Loading…"
              : `${members.length} ${members.length === 1 ? "member" : "members"}`}
          </span>
        </div>
        <div className="member-table-shell">
          <table className="member-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingMembers ? (
                <tr>
                  <td colSpan={3}>Loading organization members…</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.userId}>
                    <td>
                      <div className="member-identity">
                        <span className="member-avatar">{initials(member.displayName)}</span>
                        <span>
                          <strong>{member.displayName}</strong>
                          <small>{member.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="role-pill">{ORGANIZATION_ROLE_LABELS[member.role]}</span>
                    </td>
                    <td>
                      <span className={`membership-status membership-status--${member.status}`}>
                        <span />
                        {member.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="organization-card permission-matrix-card">
        <div className="organization-card__heading">
          <div>
            <p className="eyebrow">Role model</p>
            <h2>Permissions stay predictable.</h2>
            <p className="organization-card__description">
              The matrix below is mirrored by the application permission helpers and designed to
              align with Firebase Security Rules as each procurement module arrives.
            </p>
          </div>
        </div>
        <div className="permission-table-shell">
          <table className="permission-table">
            <thead>
              <tr>
                <th>Capability</th>
                {roles.map((role) => (
                  <th key={role}>{ORGANIZATION_ROLE_LABELS[role]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionRows.map(([label, permission]) => (
                <tr key={permission}>
                  <td>{label}</td>
                  {roles.map((role) => (
                    <td key={role}>
                      {getRolePermissions(role).includes(permission) ? (
                        <span className="permission-yes" aria-label="Allowed">
                          <Icon name="check" width={16} height={16} />
                        </span>
                      ) : (
                        <span className="permission-no" aria-label="Not allowed">
                          —
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
