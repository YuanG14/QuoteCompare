import type { SupplierInput } from "@/types/supplier";

export type SupplierFieldErrors = Partial<Record<keyof SupplierInput, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSupplier(input: SupplierInput): SupplierFieldErrors {
  const errors: SupplierFieldErrors = {};
  const name = input.name.trim();
  const category = input.category.trim();
  const email = input.email.trim();

  if (name.length < 2) errors.name = "Enter a supplier name with at least 2 characters.";
  else if (name.length > 120) errors.name = "Supplier name must be 120 characters or fewer.";

  if (category.length < 2) errors.category = "Enter a category with at least 2 characters.";
  else if (category.length > 80) errors.category = "Category must be 80 characters or fewer.";

  if (input.contactName.trim().length > 80)
    errors.contactName = "Contact name must be 80 characters or fewer.";
  if (email && !emailPattern.test(email)) errors.email = "Enter a valid email address.";
  else if (email.length > 160) errors.email = "Email must be 160 characters or fewer.";
  if (input.phone.trim().length > 30) errors.phone = "Phone number must be 30 characters or fewer.";
  if (input.address.trim().length > 240)
    errors.address = "Address must be 240 characters or fewer.";
  if (input.notes.trim().length > 600) errors.notes = "Notes must be 600 characters or fewer.";
  if (input.status !== "active" && input.status !== "inactive")
    errors.status = "Choose a valid supplier status.";

  return errors;
}

export function hasSupplierErrors(errors: SupplierFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
