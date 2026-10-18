import { catalogFoodToSnapshot, parseCatalogFood } from '../../features/food-catalog/domain/catalogFood';
import type { CatalogFood, CatalogResult, RecentFoodsRepository } from '../../features/food-catalog/domain/types';
import type { LocalDateKey, MealType, NutritionChange, NutritionResult, NutritionService } from '../../features/nutrition';
import { createOrangeRewardNotice, type OrangeRewardNotice, type OrangeWalletService } from '../../features/rewards';
import { rewardFoodEntryAdded } from '../rewards/foodEntryRewards';
import type { LocalRewardContext } from '../rewards/localRewardContext';

type Input = Readonly<{ food: CatalogFood; localDate: LocalDateKey; meal: MealType; quantityGrams: number; rewardContext: LocalRewardContext }>;
export type FoodAddResult = NutritionResult<Readonly<{ change: NutritionChange; notice: OrangeRewardNotice | null; rewardFailed: boolean; recentSaved: boolean }>>;
/** One selection/confirmation operation: concurrent/repeated submissions share its successful result. */
export function createFoodAddOperation(deps: { nutrition: NutritionService; wallet: OrangeWalletService; recents: RecentFoodsRepository;
  resolveFood?: (food: CatalogFood) => Promise<CatalogResult<CatalogFood>> }) {
  let pending: Promise<FoodAddResult> | null = null;
  const perform = async (input: Input): Promise<FoodAddResult> => {
    const rewardContext = { ...input.rewardContext };
    const { localDate, meal, quantityGrams } = input;
    const captured = parseCatalogFood(input.food);
    if (!captured.ok) return { ok: false, error: 'invalidSnapshot' };
    const resolved = deps.resolveFood ? await deps.resolveFood(captured.value) : captured;
    if (!resolved.ok) return { ok: false, error: resolved.error === 'storageUnavailable' ? 'storageUnavailable' : 'invalidSnapshot' };
    const valid = parseCatalogFood(resolved.value);
    if (!valid.ok) return { ok: false, error: 'invalidSnapshot' };
    const snapshot = catalogFoodToSnapshot(valid.value);
    if (!snapshot.ok) return snapshot;
    const changed = await deps.nutrition.addEntry({ localDate, meal, food: snapshot.value, quantityGrams });
    if (!changed.ok) return changed;
    // The diary is already committed. Later optional failures must never invite a duplicate Add.
    let notice: OrangeRewardNotice | null = null, rewardFailed = false, recentSaved = false;
    if (changed.value.fact) {
      try {
        const reward = await rewardFoodEntryAdded(deps.wallet, changed.value.fact, rewardContext);
        rewardFailed = !reward.ok;
        notice = createOrangeRewardNotice(reward, `food:${changed.value.fact.entryId}`);
      } catch { rewardFailed = true; }
      try { recentSaved = (await deps.recents.record(valid.value, changed.value.fact.occurredAt)).ok; } catch { /* best effort discovery history */ }
    }
    return { ok: true, value: { change: changed.value, notice, rewardFailed, recentSaved } };
  };
  return {
    submit(input: Input): Promise<FoodAddResult> {
      if (pending) return pending;
      pending = perform(input).catch((): FoodAddResult => ({ ok: false, error: 'storageUnavailable' })).then(result => {
        if (!result.ok) pending = null;
        return result;
      });
      return pending;
    },
  };
}
