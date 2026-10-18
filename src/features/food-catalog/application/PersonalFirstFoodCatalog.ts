import type { FoodCatalogProvider, CatalogResult, CatalogFood } from '../domain/types';
import { normalizeFoodBarcode } from '../domain/barcode';
import { personalFoodProviderId, personalFoodToCatalog } from '../../personal-foods/domain/personalFood';
import type { PersonalFoodService } from '../../personal-foods/application/PersonalFoodService';

/** Search remains deliberate remote search; local discovery is a separate immediate section. */
export function createPersonalFirstFoodCatalog(remote: FoodCatalogProvider, personal: PersonalFoodService): FoodCatalogProvider {
  return { ...remote, async getByBarcode(input, context): Promise<CatalogResult<CatalogFood | null>> {
    const code = normalizeFoodBarcode(input); if (!code) return { ok: false, error: 'invalidBarcode' };
    if (context?.signal?.aborted) return { ok: false, error: 'cancelled' };
    const local = await personal.getByBarcode(code.lookupCode);
    if (context?.signal?.aborted) return { ok: false, error: 'cancelled' };
    if (!local.ok) return { ok: false, error: local.error === 'invalidFood' ? 'invalidFood' : local.error === 'corruptData' || local.error === 'unsupportedSchema' ? local.error : 'storageUnavailable' };
    if (local.value) return { ok: true, value: personalFoodToCatalog(local.value) };
    return remote.getByBarcode ? remote.getByBarcode(code.lookupCode, context) : { ok: false, error: 'providerUnavailable' };
  } };
}
/** Recheck personal selection against canonical values before the shared committed Add. */
export async function resolvePersonalCatalogFood(food: CatalogFood, personal: PersonalFoodService): Promise<CatalogResult<CatalogFood>> {
  if (food.source.providerId !== personalFoodProviderId) return { ok: true, value: food };
  const current = await personal.getById(food.source.foodId);
  return current.ok ? current.value ? { ok: true, value: personalFoodToCatalog(current.value) } : { ok: false, error: 'invalidFood' }
    : { ok: false, error: 'storageUnavailable' };
}
