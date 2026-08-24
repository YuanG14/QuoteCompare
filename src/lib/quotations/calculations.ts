import type { QuotationLineItem } from "@/types/quotation";

export type QuotationTotals = {
  subtotal: number;
  discount: number;
  shipping: number;
  installation: number;
  tax: number;
  grandTotal: number;
};

function money(value: number): number {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

/** Pure, deterministic monetary calculation used by forms and saved views. */
export function calculateQuotationTotals(
  items: readonly QuotationLineItem[],
  charges: Pick<QuotationTotals, "discount" | "shipping" | "installation" | "tax">,
): QuotationTotals {
  const subtotal = money(
    items.reduce((total, item) => total + money(item.quantity * item.unitPrice), 0),
  );
  const discount = money(Math.max(0, charges.discount));
  const shipping = money(Math.max(0, charges.shipping));
  const installation = money(Math.max(0, charges.installation));
  const tax = money(Math.max(0, charges.tax));
  return {
    subtotal,
    discount,
    shipping,
    installation,
    tax,
    grandTotal: money(Math.max(0, subtotal - discount + shipping + installation + tax)),
  };
}

export function formatQuotationMoney(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
