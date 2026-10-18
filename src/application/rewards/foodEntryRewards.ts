import type { OrangeWalletService } from '../../features/rewards';
import type { NutritionEntryAdded } from '../../features/nutrition';
import type { LocalRewardContext } from './localRewardContext';

/** Called only for a persisted real Add. Diary date and the local day of the action are distinct. */
export function rewardFoodEntryAdded(wallet: OrangeWalletService, fact: NutritionEntryAdded, context: LocalRewardContext) {
  return wallet.processRewardEvents(snapshot => {
    const eventId = (type: string) => JSON.stringify(['food-entry', fact.entryId, type]);
    const mealEventId = eventId('mealLogged');
    const prior = snapshot.state.ledger.find(entry => entry.kind === 'credit'
      && entry.grant.eventType !== 'welcomeReward' && entry.grant.eventType !== 'activeDayMilestone');
    return [
      { ...context, type: 'mealLogged', sourceId: fact.entryId, eventId: mealEventId },
      { ...context, type: 'activeDayQualified', category: 'foodTracking', sourceId: fact.entryId, eventId: eventId('activeDayQualified') },
      { ...context, type: 'welcomeReward', qualifyingEventId: prior?.kind === 'credit' ? prior.grant.eventId : mealEventId, eventId: eventId('welcomeReward') },
    ];
  });
}
