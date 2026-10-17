import { defaultRewardRules } from './rules';
import type { OrangeBalance, RewardEvent, RewardGrant, RewardGrantResult, RewardRules } from './types';
import { isIdentity, isLocalDay, isNonnegativeInteger, isPositiveInteger, isRewardEventType, isRewardGrant, isTimestamp } from './validation';

/** Versioned tuples avoid delimiter collisions. Never derive identity from a delivery ID. */
function rewardIdentity(event: RewardEvent): string | null {
  let achievement: readonly (string | number)[];
  switch (event.type) {
    case 'mealLogged':
      if (!isIdentity(event.mealSlotId)) return null;
      achievement = [event.localDay, event.mealSlotId];
      break;
    case 'workoutCompleted':
    case 'weightLogged':
      if (!isIdentity(event.sourceId)) return null;
      achievement = [event.sourceId];
      break;
    case 'streakMilestone':
      if (!isIdentity(event.streakId) || !isPositiveInteger(event.milestoneDays)) return null;
      achievement = [event.streakId, event.milestoneDays];
      break;
    default:
      achievement = [event.localDay];
  }
  return JSON.stringify(['rewards-v1', event.type, ...achievement]);
}

export type EvaluateRewardInput = Readonly<{
  balance: OrangeBalance;
  event: RewardEvent;
  /** Complete retained grant history for this wallet; not just today's entries. */
  history: readonly RewardGrant[];
  grantedAt: string;
  rules?: RewardRules;
}>;

/** Pure evaluation only: the caller must atomically persist a successful grant later. */
export function evaluateReward({ balance, event, history, grantedAt, rules = defaultRewardRules }: EvaluateRewardInput): RewardGrantResult {
  if (!isNonnegativeInteger(balance)) return { granted: false, amount: 0, newBalance: null, reason: 'invalidBalance' };
  const decline = (reason: Exclude<RewardGrantResult['reason'], 'granted' | 'invalidBalance'>): RewardGrantResult => (
    { granted: false, amount: 0, newBalance: balance, reason }
  );
  if (!event || typeof event !== 'object') return decline('invalidEvent');
  if (!isRewardEventType(event.type)) return decline('unsupportedEvent');
  if (!isIdentity(event.eventId) || !isTimestamp(event.occurredAt) || !isLocalDay(event.localDay) || !isTimestamp(grantedAt)) {
    return decline('invalidEvent');
  }
  const identity = rewardIdentity(event);
  if (!identity) return decline('invalidEvent');

  const grantIds = new Set<string>();
  const identities = new Set<string>();
  const eventIds = new Set<string>();
  if (!Array.isArray(history)) return decline('invalidHistory');
  for (const grant of history) {
    if (!isRewardGrant(grant) || grantIds.has(grant.grantId) || identities.has(grant.rewardIdentity) || eventIds.has(grant.eventId)) {
      return decline('invalidHistory');
    }
    grantIds.add(grant.grantId);
    identities.add(grant.rewardIdentity);
    eventIds.add(grant.eventId);
  }
  if (identities.has(identity) || eventIds.has(event.eventId)) return decline('alreadyGranted');

  const rule = rules[event.type];
  if (!rule || rule.eventType !== event.type || !isPositiveInteger(rule.amount)
    || (rule.dailyCap !== null && !isPositiveInteger(rule.dailyCap))
    || (rule.eventType === 'streakMilestone' && !isPositiveInteger(rule.milestoneDays))) return decline('invalidRule');
  if (event.type === 'streakMilestone' && rule.eventType === 'streakMilestone' && event.milestoneDays !== rule.milestoneDays) {
    return decline('unsupportedMilestone');
  }
  const dailyCount = history.filter(grant => grant.eventType === event.type && grant.localDay === event.localDay).length;
  if (rule.dailyCap !== null && dailyCount >= rule.dailyCap) return decline('dailyCapReached');
  const newBalance = balance + rule.amount;
  if (!isNonnegativeInteger(newBalance)) return decline('balanceOverflow');

  return {
    granted: true, amount: rule.amount, newBalance: newBalance as OrangeBalance, reason: 'granted',
    grant: {
      grantId: `reward:${identity}`, rewardIdentity: identity, eventId: event.eventId,
      eventType: event.type, localDay: event.localDay, amount: rule.amount, grantedAt,
    },
  };
}
