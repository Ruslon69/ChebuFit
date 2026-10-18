import type { RewardGrant } from '../domain/types';

export type RewardFeedbackKind = 'micro' | 'celebration';

/** Presentation policy only; amounts never determine importance. */
export function getRewardFeedbackKind(grants: readonly RewardGrant[]): RewardFeedbackKind {
  return grants.some(grant => grant.eventType === 'welcomeReward' || grant.eventType === 'activeDayMilestone')
    ? 'celebration' : 'micro';
}

// Total lifetime includes entrance and exit. Keep ordinary feedback brief.
export const rewardFeedbackTiming = {
  micro: { enter: 220, hold: 1400, exit: 180 },
  celebration: { enter: 260, hold: 2220, exit: 220 },
} as const;
