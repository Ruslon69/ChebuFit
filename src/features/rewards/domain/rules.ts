import type { RewardRules } from './types';

/** Approved Orange Economy v1. All production amounts and cap periods live here. */
export const defaultRewardRules = {
  mealLogged: { eventType: 'mealLogged', amount: 2, period: 'localDay', limit: 1 },
  plannedMealsCompleted: { eventType: 'plannedMealsCompleted', amount: 1, period: 'localDay', limit: 1 },
  waterGoalCompleted: { eventType: 'waterGoalCompleted', amount: 2, period: 'localDay', limit: 1 },
  workoutCompleted: { eventType: 'workoutCompleted', amount: 3, period: 'localDay', limit: 1 },
  weightLogged: { eventType: 'weightLogged', amount: 1, period: 'localWeek', limit: 1 },
  activeDayQualified: { eventType: 'activeDayQualified', amount: 5, period: 'localDay', limit: 1 },
  welcomeReward: { eventType: 'welcomeReward', amount: 10, period: 'lifetime', limit: 1 },
  activeDayMilestone: {
    eventType: 'activeDayMilestone', period: 'milestone', limit: 1,
    milestones: [
      { activeDays: 7, amount: 10 },
      { activeDays: 30, amount: 20 },
      { activeDays: 90, amount: 35 },
      { activeDays: 180, amount: 50 },
      { activeDays: 365, amount: 75 },
    ],
  },
} as const satisfies RewardRules;
