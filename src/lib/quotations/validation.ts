import type { QuotationInput } from "@/types/quotation";

export type QuotationFieldErrors = Partial<Record<string, string>>;

export function validateQuotation(input: QuotationInput): QuotationFieldErrors {
  const errors: QuotationFieldErrors = {};
  if (!input.rfqId) errors.rfqId = "Select an Issued RFQ.";
  if (!input.supplierId) errors.supplierId = "Select a supplier invited to this RFQ.";
  if (input.items.length < 1 || input.items.length > 30)
    errors.items = "A quotation needs between 1 and 30 item lines.";
  input.items.forEach((item, index) => {
    if (!item.name.trim() || item.name.length > 140)
      errors[`item.${index}.name`] = "Keep the item name between 1 and 140 characters.";
    if (!Number.isFinite(item.quantity) || item.quantity <= 0 || item.quantity > 1000000)
      errors[`item.${index}.quantity`] = "Enter a quantity greater than zero.";
    if (!item.unit.trim() || item.unit.length > 30)
      errors[`item.${index}.unit`] = "Enter a unit up to 30 characters.";
    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0 || item.unitPrice > 1000000000)
      errors[`item.${index}.unitPrice`] = "Enter a valid non-negative unit price.";
  });
  (["discount", "shipping", "installation", "tax"] as const).forEach((field) => {
    if (!Number.isFinite(input[field]) || input[field] < 0 || input[field] > 1000000000)
      errors[field] = "Enter a non-negative amount below ₱1 billion.";
  });
  if (input.warranty.trim().length < 2 || input.warranty.length > 500)
    errors.warranty = "Describe the warranty in 2 to 500 characters.";
  if (input.deliveryCommitment.trim().length < 2 || input.deliveryCommitment.length > 500)
    errors.deliveryCommitment = "Describe delivery in 2 to 500 characters.";
  if (input.paymentTerms.trim().length < 2 || input.paymentTerms.length > 500)
    errors.paymentTerms = "Describe payment terms in 2 to 500 characters.";
  if (input.notes.length > 1000) errors.notes = "Keep notes within 1,000 characters.";
  if (input.source.filename.length > 180) errors.source = "The source filename is too long.";
  return errors;
}

export function hasQuotationErrors(errors: QuotationFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
