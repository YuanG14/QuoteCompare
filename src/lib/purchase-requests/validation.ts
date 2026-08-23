import type { PurchaseRequestInput } from "@/types/purchase-request";

export type PurchaseRequestFieldErrors = Partial<
  Record<
    | keyof PurchaseRequestInput
    | `item.${number}.${"name" | "quantity" | "unit" | "specifications"}`,
    string
  >
>;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function validatePurchaseRequest(input: PurchaseRequestInput): PurchaseRequestFieldErrors {
  const errors: PurchaseRequestFieldErrors = {};
  const requiredText: Array<
    ["title" | "requesterName" | "department" | "purpose", number, number]
  > = [
    ["title", 3, 140],
    ["requesterName", 2, 100],
    ["department", 2, 100],
    ["purpose", 10, 800],
  ];

  for (const [field, minimum, maximum] of requiredText) {
    const length = input[field].trim().length;
    if (length < minimum) errors[field] = `Enter at least ${minimum} characters.`;
    else if (length > maximum) errors[field] = `Keep this field within ${maximum} characters.`;
  }

  if (!Number.isFinite(input.budget) || input.budget < 0 || input.budget > 1_000_000_000) {
    errors.budget = "Enter a budget from ₱0 to ₱1,000,000,000.";
  }
  if (
    !datePattern.test(input.requiredDate) ||
    Number.isNaN(Date.parse(`${input.requiredDate}T00:00:00Z`))
  ) {
    errors.requiredDate = "Choose a valid required date.";
  }
  if (input.notes.trim().length > 1200) errors.notes = "Notes must be 1,200 characters or fewer.";
  if (input.items.length < 1) errors.items = "Add at least one requested item.";
  else if (input.items.length > 30) errors.items = "A purchase request can contain up to 30 items.";

  input.items.forEach((item, index) => {
    if (item.name.trim().length < 2 || item.name.trim().length > 140) {
      errors[`item.${index}.name`] = "Enter an item name between 2 and 140 characters.";
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0 || item.quantity > 1_000_000) {
      errors[`item.${index}.quantity`] =
        "Quantity must be greater than 0 and no more than 1,000,000.";
    }
    if (item.unit.trim().length < 1 || item.unit.trim().length > 30) {
      errors[`item.${index}.unit`] = "Enter a unit within 30 characters.";
    }
    if (item.specifications.trim().length > 600) {
      errors[`item.${index}.specifications`] = "Specifications must be 600 characters or fewer.";
    }
  });

  if (!(["draft", "open", "closed"] as const).includes(input.status)) {
    errors.status = "Choose a valid request status.";
  }
  return errors;
}

export function hasPurchaseRequestErrors(errors: PurchaseRequestFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
