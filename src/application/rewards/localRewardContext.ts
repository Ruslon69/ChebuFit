import type { LocalCalendarDay } from '../../features/rewards';

export type LocalRewardContext = Readonly<{ localDay: LocalCalendarDay; occurredAt: string }>;

/** Capture the device's current local date explicitly, independently of the UTC instant. */
export function createLocalRewardContext(now: Date): LocalRewardContext {
  const year = String(now.getFullYear()).padStart(4, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return { localDay: `${year}-${month}-${day}` as LocalCalendarDay, occurredAt: now.toISOString() };
}
