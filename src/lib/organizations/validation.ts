export type ValidationResult = { valid: true } | { valid: false; message: string };

export function validateOrganizationName(value: string): ValidationResult {
  const name = value.trim();
  if (name.length < 2) return { valid: false, message: "Organization name must be at least 2 characters." };
  if (name.length > 80) return { valid: false, message: "Organization name must be 80 characters or fewer." };
  if (!/[A-Za-z0-9]/.test(name)) return { valid: false, message: "Organization name must include at least one letter or number." };
  return { valid: true };
}
