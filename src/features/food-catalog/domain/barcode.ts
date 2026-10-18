export const foodBarcodeTypes = ['ean13', 'ean8', 'upc_a', 'upc_e'] as const;
export type FoodBarcodeType = typeof foodBarcodeTypes[number];
export type FoodBarcode = Readonly<{ displayCode: string; lookupCode: string }>;

/** Keep identifiers as strings. Eight untyped digits mean EAN-8, not guessed UPC-E. */
export function normalizeFoodBarcode(input: unknown, format?: string): FoodBarcode | null {
  if (typeof input !== 'string' || (format !== undefined && !foodBarcodeTypes.some(type => type === format))) return null;
  const code = input.trim();
  if (!/^(?:\d{8}|\d{12,14})$/.test(code) || /^0+$/.test(code)) return null;
  if (format !== 'upc_e') return { displayCode: code, lookupCode: code };
  if (!/^[01]\d{7}$/.test(code)) return null;
  // Standard UPC-E zero suppression: expand for product databases keyed by GTIN-12.
  const system = code[0], digits = code.slice(1, 7), last = digits[5], check = code[7];
  const body = '012'.includes(last) ? `${digits.slice(0, 2)}${last}0000${digits.slice(2, 5)}`
    : last === '3' ? `${digits.slice(0, 3)}00000${digits.slice(3, 5)}`
      : last === '4' ? `${digits.slice(0, 4)}00000${digits[4]}` : `${digits.slice(0, 5)}0000${last}`;
  return { displayCode: code, lookupCode: `${system}${body}${check}` };
}
