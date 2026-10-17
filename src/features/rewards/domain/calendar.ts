import type { LocalCalendarDay, LocalCalendarWeek } from './types';

export function isLocalDay(value: unknown): value is LocalCalendarDay {
  if (typeof value !== 'string' || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Date-only arithmetic: UTC avoids host timezone/DST effects, not user-day inference. */
export function getLocalWeekStart(localDay: LocalCalendarDay): LocalCalendarWeek | null {
  if (!isLocalDay(localDay)) return null;
  const date = new Date(`${localDay}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10) as LocalCalendarWeek;
}
