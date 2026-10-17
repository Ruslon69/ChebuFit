import type { ActiveDayCategory, RewardEventType, RewardGrant } from './types';
import { getLocalWeekStart, isLocalDay } from './calendar';

export const isNonnegativeInteger = (value: number): boolean => Number.isSafeInteger(value) && value >= 0;
export const isPositiveInteger = (value: number): boolean => Number.isSafeInteger(value) && value > 0;
export const isIdentity = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export function isActiveDayCategory(value: unknown): value is ActiveDayCategory {
  return value === 'foodTracking' || value === 'waterTracking' || value === 'completedWorkout';
}

export function isTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)
    && isLocalDay(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
}

export function isRewardEventType(value: unknown): value is RewardEventType {
  return typeof value === 'string' && [
    'mealLogged', 'plannedMealsCompleted', 'waterGoalCompleted', 'workoutCompleted',
    'weightLogged', 'activeDayQualified', 'welcomeReward', 'activeDayMilestone',
  ].includes(value);
}

export function isRewardGrant(grant: RewardGrant): boolean {
  return grant !== null && typeof grant === 'object'
    && isIdentity(grant.grantId) && isIdentity(grant.rewardIdentity) && isIdentity(grant.eventId)
    && isRewardEventType(grant.eventType) && isLocalDay(grant.localDay)
    && grant.localWeek === getLocalWeekStart(grant.localDay)
    && (grant.sourceId === undefined || isIdentity(grant.sourceId))
    && (!['workoutCompleted', 'weightLogged', 'activeDayQualified'].includes(grant.eventType) || isIdentity(grant.sourceId))
    && (grant.eventType !== 'activeDayQualified' || isActiveDayCategory(grant.category))
    && (grant.eventType !== 'activeDayMilestone' || isPositiveInteger(grant.activeDays ?? 0))
    && (grant.eventType !== 'welcomeReward' || isIdentity(grant.qualifyingEventId))
    && isPositiveInteger(grant.amount) && isTimestamp(grant.grantedAt);
}
