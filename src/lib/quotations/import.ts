import type { QuotationLineItem, QuotationSourceType } from "@/types/quotation";

export type CsvQuotationRow = {
  name: string;
  quantity: number | null;
  unit: string;
  unitPrice: number | null;
};

export function sourceTypeForFile(file: File): QuotationSourceType | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "csv") return "csv";
  if (extension === "pdf") return "pdf";
  if (extension === "xlsx" || extension === "xls") return "excel";
  return null;
}

export async function checksumFile(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else cell += character;
  }
  cells.push(cell.trim());
  return cells;
}

function key(value: string): string {
  return value.toLowerCase().replace(/[\s_-]+/g, "");
}

export function parseQuotationCsv(text: string): CsvQuotationRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2) throw new Error("The CSV needs a header and at least one item row.");
  const headers = splitCsvLine(lines[0]).map(key);
  const find = (...names: string[]) => headers.findIndex((header) => names.includes(header));
  const nameIndex = find("item", "name", "description", "itemname");
  const quantityIndex = find("quantity", "qty");
  const unitIndex = find("unit", "uom");
  const priceIndex = find("unitprice", "price", "unitcost");
  if (nameIndex < 0 || priceIndex < 0)
    throw new Error("CSV headers must include item (or name) and unit_price (or price).");
  return lines.slice(1, 31).map((line) => {
    const cells = splitCsvLine(line);
    const quantity = quantityIndex >= 0 ? Number(cells[quantityIndex]) : Number.NaN;
    const price = Number((cells[priceIndex] ?? "").replace(/[^0-9.-]/g, ""));
    return {
      name: cells[nameIndex] ?? "",
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : null,
      unit: unitIndex >= 0 ? (cells[unitIndex] ?? "") : "",
      unitPrice: Number.isFinite(price) && price >= 0 ? price : null,
    };
  });
}

export function mergeCsvRows(
  items: readonly QuotationLineItem[],
  rows: readonly CsvQuotationRow[],
): QuotationLineItem[] {
  return items.map((item, index) => {
    const normalized = key(item.name);
    const row = rows.find((candidate) => key(candidate.name) === normalized) ?? rows[index];
    if (!row) return item;
    return {
      ...item,
      quantity: row.quantity ?? item.quantity,
      unit: row.unit || item.unit,
      unitPrice: row.unitPrice ?? item.unitPrice,
    };
  });
}
