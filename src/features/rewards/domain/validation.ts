import type { LocalCalendarDay, RewardEventType, RewardGrant } from './types';

export const isNonnegativeInteger = (value: number): boolean => Number.isSafeInteger(value) && value >= 0;
export const isPositiveInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0;
export const isIdentity = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export function isLocalDay(value: unknown): value is LocalCalendarDay {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && isLocalDay(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
}

export function isRewardEventType(value: unknown): value is RewardEventType {
  return typeof value === 'string' && [
    'mealLogged', 'dailyMealsCompleted', 'waterGoalCompleted', 'workoutCompleted',
    'weightLogged', 'dailyTrackingCompleted', 'streakMilestone',
  ].includes(value);
}

export function isRewardGrant(grant: RewardGrant): boolean {
  return grant !== null && typeof grant === 'object'
    && isIdentity(grant.grantId) && isIdentity(grant.rewardIdentity) && isIdentity(grant.eventId)
    && isRewardEventType(grant.eventType) && isLocalDay(grant.localDay)
    && isPositiveInteger(grant.amount) && isTimestamp(grant.grantedAt);
}
