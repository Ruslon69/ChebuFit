/** Caller-owned local calendar identity, independent of a UTC timestamp. */
export type LocalDateKey = `${number}-${number}-${number}`;

export function isLocalDateKey(value: unknown): value is LocalDateKey {
  if (typeof value !== 'string' || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function getLocalDateKey(date: Date): LocalDateKey {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` as LocalDateKey;
}
