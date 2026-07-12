const numberFormatter = new Intl.NumberFormat("ja-JP");

export function formatNumber(
  value: number | null | undefined,
  digits = 0,
): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return numberFormatter.format(digits ? Number(value.toFixed(digits)) : value);
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
