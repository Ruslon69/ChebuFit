import { getLocalDateKey } from '../../shared/utils/localCalendar';
import type { LocalCalendarDay } from '../../features/rewards';

export type LocalRewardContext = Readonly<{ localDay: LocalCalendarDay; occurredAt: string }>;

/** Capture the device's current local date explicitly, independently of the UTC instant. */
export function createLocalRewardContext(now: Date): LocalRewardContext {
  return { localDay: getLocalDateKey(now), occurredAt: now.toISOString() };
}
