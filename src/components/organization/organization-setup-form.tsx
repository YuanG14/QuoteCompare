"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icons";
import { getOrganizationErrorMessage } from "@/lib/organizations/errors";
import { createOrganizationForUser } from "@/lib/organizations/service";
import { validateOrganizationName } from "@/lib/organizations/validation";
import { useAuth } from "@/providers/auth-provider";
import { useOrganization } from "@/providers/organization-provider";

export function OrganizationSetupForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { status, refresh } = useOrganization();
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "ready") router.replace("/dashboard");
  }, [router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const validation = validateOrganizationName(name);
    if (!validation.valid) {
      setFieldError(validation.message);
      return;
    }

    setFieldError(null);
    setFormError(null);
    setSubmitting(true);
    try {
      await createOrganizationForUser(user, name);
      await refresh();
      router.replace("/dashboard");
    } catch (error) {
      setFormError(getOrganizationErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="organization-setup-form" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <div className="form-notice form-notice--error" role="alert">
          {formError}
        </div>
      ) : null}
      <div className="form-field">
        <label className="form-label" htmlFor="organization-name">
          Organization name
        </label>
        <input
          className={`form-input ${fieldError ? "form-input--error" : ""}`}
          id="organization-name"
          name="organization-name"
          type="text"
          autoComplete="organization"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Northstar Procurement"
          maxLength={80}
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? "organization-name-error" : "organization-name-hint"}
        />
        {fieldError ? (
          <span className="form-error" id="organization-name-error">
            {fieldError}
          </span>
        ) : (
          <span className="form-hint" id="organization-name-hint">
            This becomes the workspace name shown to your members.
          </span>
        )}
      </div>
      <button
        className="button button--accent organization-setup-submit"
        type="submit"
        disabled={submitting || !user}
      >
        <Icon name="shield" width={18} height={18} />
        <span>{submitting ? "Creating secure workspace…" : "Create organization workspace"}</span>
      </button>
      <p className="organization-setup-footnote">
        You will become the first <strong>Admin</strong>. Roles are enforced by Firestore Security
        Rules, not just the interface.
      </p>
    </form>
  );
}
