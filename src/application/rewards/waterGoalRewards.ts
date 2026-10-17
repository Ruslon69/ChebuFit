import type { OrangeWalletService } from '../../features/rewards';
import type { LocalRewardContext } from './localRewardContext';

/** An already-qualified water fact. Ordered grants commit in one wallet save. */
export function rewardWaterGoalReached(wallet: OrangeWalletService, context: LocalRewardContext) {
  return wallet.processRewardEvents(snapshot => {
    const eventId = (type: string) => JSON.stringify(['water-goal', context.localDay, type]);
    const waterEventId = eventId('waterGoalCompleted');
    const priorUsefulGrant = snapshot.state.ledger.find(entry => entry.kind === 'credit'
      && entry.grant.eventType !== 'welcomeReward' && entry.grant.eventType !== 'activeDayMilestone');
    const qualifyingEventId = priorUsefulGrant?.kind === 'credit' ? priorUsefulGrant.grant.eventId : waterEventId;
    return [
      { ...context, type: 'waterGoalCompleted', eventId: waterEventId },
      { ...context, type: 'activeDayQualified', category: 'waterTracking', sourceId: `water-goal:${context.localDay}`, eventId: eventId('activeDayQualified') },
      { ...context, type: 'welcomeReward', qualifyingEventId, eventId: eventId('welcomeReward') },
    ];
  });
}
