import type { RfqInput } from "@/types/rfq";

export type RfqFieldErrors = Partial<Record<string, string>>;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function validateRfq(input: RfqInput, requiredDate?: string): RfqFieldErrors {
  const errors: RfqFieldErrors = {};
  if (!input.purchaseRequestId) errors.purchaseRequestId = "Select an open purchase request.";
  if (input.title.trim().length < 3 || input.title.trim().length > 160)
    errors.title = "Enter a title between 3 and 160 characters.";
  if (input.items.length < 1 || input.items.length > 30)
    errors.items = "Include between 1 and 30 requested items.";
  input.items.forEach((item, index) => {
    if (item.name.trim().length < 2 || item.name.trim().length > 140)
      errors[`item.${index}.name`] = "Enter an item name between 2 and 140 characters.";
    if (!Number.isFinite(item.quantity) || item.quantity <= 0 || item.quantity > 1_000_000)
      errors[`item.${index}.quantity`] =
        "Enter a quantity greater than 0 and no more than 1,000,000.";
    if (item.unit.trim().length < 1 || item.unit.trim().length > 30)
      errors[`item.${index}.unit`] = "Enter a unit within 30 characters.";
    if (item.specifications.trim().length > 600)
      errors[`item.${index}.specifications`] = "Specifications must be 600 characters or fewer.";
  });

  if (input.criteria.length < 1 || input.criteria.length > 20)
    errors.criteria = "Add between 1 and 20 evaluation requirements.";
  input.criteria.forEach((criterion, index) => {
    if (criterion.label.trim().length < 2 || criterion.label.trim().length > 120)
      errors[`criterion.${index}.label`] = "Enter a criterion name between 2 and 120 characters.";
    if (criterion.description.trim().length > 500)
      errors[`criterion.${index}.description`] = "Description must be 500 characters or fewer.";
  });

  if (!datePattern.test(input.quotationDeadline))
    errors.quotationDeadline = "Choose a valid quotation deadline.";
  else {
    const today = new Date().toISOString().slice(0, 10);
    if (input.quotationDeadline < today)
      errors.quotationDeadline = "The quotation deadline cannot be in the past.";
    else if (requiredDate && input.quotationDeadline > requiredDate)
      errors.quotationDeadline =
        "The quotation deadline must be on or before the purchase request's required date.";
  }
  if (input.deliveryDestination.trim().length < 5 || input.deliveryDestination.trim().length > 240)
    errors.deliveryDestination = "Enter a delivery destination between 5 and 240 characters.";
  if (input.paymentExpectations.trim().length < 5 || input.paymentExpectations.trim().length > 500)
    errors.paymentExpectations = "Enter payment expectations between 5 and 500 characters.";
  if (input.evaluationCriteria.trim().length < 10 || input.evaluationCriteria.trim().length > 900)
    errors.evaluationCriteria = "Describe the evaluation approach in 10 to 900 characters.";
  if (input.selectedSuppliers.length < 1 || input.selectedSuppliers.length > 20)
    errors.selectedSuppliers = "Select between 1 and 20 active suppliers.";
  return errors;
}

export function hasRfqErrors(errors: RfqFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
