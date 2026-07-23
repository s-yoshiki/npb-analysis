const formatters = new Map<number, Intl.NumberFormat>();

/**
 * Columns are read against each other, so a fixed number of decimals is kept
 * even when they are zero: an ERA of 2.8 must line up as "2.80" beside "2.81".
 */
function formatterFor(digits: number): Intl.NumberFormat {
  const cached = formatters.get(digits);
  if (cached) return cached;

  const formatter = new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
  formatters.set(digits, formatter);
  return formatter;
}

export function formatNumber(
  value: number | null | undefined,
  digits = 0,
): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return formatterFor(digits).format(value);
}

export function formatRate(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return value.toFixed(3).replace(/^0/, "");
}

export function sumNumeric<T extends Record<string, unknown>>(
  rows: T[],
  key: keyof T,
): number {
  return rows.reduce((total, row) => {
    const value = row[key];
    return total + (typeof value === "number" ? value : 0);
  }, 0);
}
