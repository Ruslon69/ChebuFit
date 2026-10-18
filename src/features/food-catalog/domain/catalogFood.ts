import { entryNutrition, parseFoodSnapshot, quantityFromGrams } from '../../nutrition/domain/nutrition';
import type { FoodId, FoodSnapshot, NutritionResult } from '../../nutrition/domain/types';
import type { CatalogFood, CatalogResult } from './types';

export const catalogFoodIdentity = (food: Pick<CatalogFood, 'source'>) => JSON.stringify([food.source.providerId, food.source.foodId]);
/** The diary gets a detached snapshot, never a reference that later needs a provider lookup. */
export function catalogFoodToSnapshot(food: CatalogFood): NutritionResult<FoodSnapshot> {
  return parseFoodSnapshot({
    foodId: catalogFoodIdentity(food) as FoodId, name: food.name, brand: food.brand,
    source: { provider: food.source.providerId, externalId: food.source.foodId, ...(food.barcode ? { barcode: food.barcode } : {}) },
    basis: food.basis, nutrients: food.nutrients,
  });
}
export function parseCatalogFood(value: unknown): CatalogResult<CatalogFood> {
  const invalid = { ok: false, error: 'invalidFood' } as const;
  if (!value || typeof value !== 'object') return invalid;
  const food = value as Partial<CatalogFood>;
  if (!food.source || typeof food.source.providerId !== 'string' || !food.source.providerId.trim()
    || typeof food.source.foodId !== 'string' || !food.source.foodId.trim()) return invalid;
  if (food.barcode !== undefined && (typeof food.barcode !== 'string' || !food.barcode.trim())) return invalid;
  const snapshot = catalogFoodToSnapshot(food as CatalogFood);
  if (!snapshot.ok || (food.imageUrl !== undefined && (typeof food.imageUrl !== 'string' || !/^https?:\/\//.test(food.imageUrl)))) return invalid;
  if (food.serving !== undefined && (!food.serving || typeof food.serving.label !== 'string' || !food.serving.label.trim() || !quantityFromGrams(food.serving.grams).ok)) return invalid;
  return { ok: true, value: {
    source: { providerId: food.source.providerId, foodId: food.source.foodId }, name: snapshot.value.name, basis: 'per100g', nutrients: snapshot.value.nutrients,
    ...(snapshot.value.brand ? { brand: snapshot.value.brand } : {}), ...(snapshot.value.source?.barcode ? { barcode: snapshot.value.source.barcode } : {}),
    ...(food.imageUrl ? { imageUrl: food.imageUrl } : {}), ...(food.serving ? { serving: { ...food.serving } } : {}),
  } };
}
export function previewCatalogFood(food: CatalogFood, grams: number) {
  const snapshot = catalogFoodToSnapshot(food), quantity = quantityFromGrams(grams);
  if (!snapshot.ok) return snapshot;
  if (!quantity.ok) return quantity;
  return entryNutrition({ food: snapshot.value, quantity: quantity.value });
}
