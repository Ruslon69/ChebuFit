import type { RewardRules } from './types';

/** Initial product tuning; all reward amounts and per-local-day caps live here. */
export const defaultRewardRules = {
  mealLogged: { eventType: 'mealLogged', amount: 2, dailyCap: 4 },
  dailyMealsCompleted: { eventType: 'dailyMealsCompleted', amount: 5, dailyCap: 1 },
  waterGoalCompleted: { eventType: 'waterGoalCompleted', amount: 3, dailyCap: 1 },
  workoutCompleted: { eventType: 'workoutCompleted', amount: 10, dailyCap: 1 },
  weightLogged: { eventType: 'weightLogged', amount: 2, dailyCap: 1 },
  dailyTrackingCompleted: { eventType: 'dailyTrackingCompleted', amount: 5, dailyCap: 1 },
  streakMilestone: { eventType: 'streakMilestone', amount: 15, dailyCap: null, milestoneDays: 7 },
} as const satisfies RewardRules;
