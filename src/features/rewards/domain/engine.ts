import { getLocalWeekStart, isLocalDay } from './calendar';
import { defaultRewardRules } from './rules';
import type { OrangeBalance, RewardEvent, RewardGrant, RewardGrantResult, RewardRules } from './types';
import { isActiveDayCategory, isIdentity, isNonnegativeInteger, isPositiveInteger, isRewardEventType, isRewardGrant, isTimestamp } from './validation';

export type EvaluateRewardInput = Readonly<{
  balance: OrangeBalance;
  event: RewardEvent;
  /** Complete retained successful grants for one wallet, including deleted sources. */
  history: readonly RewardGrant[];
  grantedAt: string;
  rules?: RewardRules;
}>;

/** Pure evaluation. Future storage must commit identity/caps/ledger/balance atomically. */
export function evaluateReward({ balance, event, history, grantedAt, rules = defaultRewardRules }: EvaluateRewardInput): RewardGrantResult {
  if (!isNonnegativeInteger(balance)) return { granted: false, amount: 0, newBalance: null, reason: 'invalidBalance' };
  const decline = (reason: Exclude<RewardGrantResult['reason'], 'granted' | 'invalidBalance'>): RewardGrantResult => (
    { granted: false, amount: 0, newBalance: balance, reason }
  );
  if (!event || typeof event !== 'object') return decline('invalidEvent');
  if (!isRewardEventType(event.type)) return decline('unsupportedEvent');
  if (!isIdentity(event.eventId) || !isTimestamp(event.occurredAt) || !isLocalDay(event.localDay) || !isTimestamp(grantedAt)
    || (event.sourceId !== undefined && !isIdentity(event.sourceId))) return decline('invalidEvent');
  const localWeek = getLocalWeekStart(event.localDay);
  if (!localWeek) return decline('invalidEvent');
  if (['workoutCompleted', 'weightLogged', 'activeDayQualified'].includes(event.type) && !isIdentity(event.sourceId)) return decline('invalidEvent');
  if (event.type === 'activeDayQualified' && !isActiveDayCategory(event.category)) return decline('invalidEvent');
  if (event.type === 'welcomeReward' && !isIdentity(event.qualifyingEventId)) return decline('invalidEvent');
  if (event.type === 'activeDayMilestone' && !isPositiveInteger(event.activeDays)) return decline('invalidEvent');

  // Product identity is independent of delivery IDs and source recreation.
  const achievement = event.type === 'weightLogged' ? [localWeek]
    : event.type === 'welcomeReward' ? []
    : event.type === 'activeDayMilestone' ? [event.activeDays] : [event.localDay];
  const identity = JSON.stringify(['rewards-v1', event.type, ...achievement]);
  const ids = new Set<string>(), identities = new Set<string>(), eventIds = new Set<string>();
  if (!Array.isArray(history)) return decline('invalidHistory');
  for (const grant of history) {
    if (!isRewardGrant(grant) || ids.has(grant.grantId) || identities.has(grant.rewardIdentity) || eventIds.has(grant.eventId)) return decline('invalidHistory');
    ids.add(grant.grantId);
    identities.add(grant.rewardIdentity);
    eventIds.add(grant.eventId);
  }
  if (identities.has(identity) || eventIds.has(event.eventId)) return decline('alreadyGranted');
  // A rewarded source cannot be relabeled into a later period after an edit/retry.
  if ((event.type === 'workoutCompleted' || event.type === 'weightLogged')
    && history.some(grant => grant.eventType === event.type && grant.sourceId === event.sourceId)) return decline('alreadyGranted');

  const rule = rules?.[event.type];
  const period = event.type === 'activeDayMilestone' ? 'milestone' : event.type === 'welcomeReward' ? 'lifetime'
    : event.type === 'weightLogged' ? 'localWeek' : 'localDay';
  if (!rule || rule.eventType !== event.type || rule.limit !== 1 || rule.period !== period) return decline('invalidRule');
  let amount: number;
  if (rule.period === 'milestone') {
    if (!Array.isArray(rule.milestones) || rule.milestones.some(m => !m || !isPositiveInteger(m.activeDays) || !isPositiveInteger(m.amount))
      || new Set(rule.milestones.map(m => m.activeDays)).size !== rule.milestones.length) return decline('invalidRule');
    if (event.type !== 'activeDayMilestone') return decline('invalidRule');
    const milestone = rule.milestones.find(m => m.activeDays === event.activeDays);
    if (!milestone) return decline('unsupportedMilestone');
    if (history.some(grant => grant.eventType === event.type && grant.activeDays === event.activeDays)) return decline('alreadyGranted');
    const activeDays = new Set(history.filter(grant => grant.eventType === 'activeDayQualified').map(grant => grant.localDay)).size;
    if (activeDays < milestone.activeDays) return decline('notEligible');
    amount = milestone.amount;
  } else {
    if (!isPositiveInteger(rule.amount)) return decline('invalidRule');
    const previous = history.filter(grant => grant.eventType === event.type);
    if (rule.period === 'localDay' && previous.some(grant => grant.localDay === event.localDay)) return decline('dailyCapReached');
    if (rule.period === 'localWeek' && previous.some(grant => grant.localWeek === localWeek)) return decline('weeklyCapReached');
    if (rule.period === 'lifetime' && previous.length) return decline('alreadyGranted');
    if (event.type === 'welcomeReward') {
      const qualifyingGrant = history.find(grant => grant.eventId === event.qualifyingEventId);
      if (!qualifyingGrant || qualifyingGrant.eventType === 'welcomeReward' || qualifyingGrant.eventType === 'activeDayMilestone') return decline('notEligible');
    }
    amount = rule.amount;
  }
  const newBalance = balance + amount;
  if (!isNonnegativeInteger(newBalance)) return decline('balanceOverflow');
  return {
    granted: true, amount, newBalance: newBalance as OrangeBalance, reason: 'granted',
    grant: {
      grantId: `reward:${identity}`, rewardIdentity: identity, eventId: event.eventId,
      eventType: event.type, localDay: event.localDay, localWeek, amount, grantedAt,
      ...(event.sourceId !== undefined ? { sourceId: event.sourceId } : {}),
      ...(event.type === 'activeDayQualified' ? { category: event.category } : {}),
      ...(event.type === 'welcomeReward' ? { qualifyingEventId: event.qualifyingEventId } : {}),
      ...(event.type === 'activeDayMilestone' ? { activeDays: event.activeDays } : {}),
    },
  };
}
