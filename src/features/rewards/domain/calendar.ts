import type { LocalCalendarDay, LocalCalendarWeek } from './types';

import { isLocalDateKey as isLocalDay } from '../../../shared/utils/localCalendar';
export { isLocalDay };

/** Date-only arithmetic: UTC avoids host timezone/DST effects, not user-day inference. */
export function getLocalWeekStart(localDay: LocalCalendarDay): LocalCalendarWeek | null {
  if (!isLocalDay(localDay)) return null;
  const date = new Date(`${localDay}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10) as LocalCalendarWeek;
}
