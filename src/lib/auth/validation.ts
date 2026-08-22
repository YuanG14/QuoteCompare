export type ValidationResult = { valid: true } | { valid: false; message: string };

export function validateEmail(email: string): ValidationResult {
  const normalized = email.trim();
  if (!normalized) return { valid: false, message: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { valid: false, message: "Enter a valid email address." };
  }
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." };
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return { valid: false, message: "Use uppercase, lowercase, and at least one number." };
  }
  return { valid: true };
}

export function validateDisplayName(name: string): ValidationResult {
  const normalized = name.trim();
  if (normalized.length < 2) {
    return { valid: false, message: "Enter your full name." };
  }
  if (normalized.length > 80) {
    return { valid: false, message: "Name must be 80 characters or fewer." };
  }
  return { valid: true };
}
