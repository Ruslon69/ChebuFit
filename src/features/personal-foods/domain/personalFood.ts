import { isNutrients, isObject, isTimestamp } from '../../nutrition/domain/nutrition';
import type { Nutrients } from '../../nutrition/domain/types';
import type { CatalogFood, RecentFood } from '../../food-catalog/domain/types';
import { normalizeFoodBarcode } from '../../food-catalog/domain/barcode';

export const personalFoodProviderId = 'chebufit-personal';
export type PersonalFoodId = string;
export type PersonalFoodInput = Readonly<{ name: string; brand?: string; nutrients: Nutrients; barcode?: string }>;
export type PersonalFood = PersonalFoodInput & Readonly<{ id: PersonalFoodId; createdAt: string; updatedAt: string }>;
export type PersonalFoodResult<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false;
  error: 'invalidFood' | 'notFound' | 'duplicateBarcode' | 'duplicateId' | 'invalidTimestamp' | 'corruptData' | 'unsupportedSchema' | 'storageUnavailable';
  existing?: PersonalFood }>;
export const isPersonalFoodId = (id: unknown): id is PersonalFoodId => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(id);
// Equivalent zero-padded GTIN representations share an identity; stored display zeroes remain intact.
export const personalBarcodeIdentity = (code: string) => normalizeFoodBarcode(code)?.lookupCode.padStart(14, '0') ?? null;
const cleanText = (value: unknown, max: number): value is string => typeof value === 'string' && value === value.trim()
  && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
export function parsePersonalFoodInput(value: unknown): PersonalFoodResult<PersonalFoodInput> {
  if (!isObject(value) || !cleanText(value.name, 200) || (value.brand !== undefined && !cleanText(value.brand, 120))
    || !isNutrients(value.nutrients) || value.nutrients.energyCentiKcal > 100000
    || value.nutrients.proteinMg > 100000 || value.nutrients.fatMg > 100000 || value.nutrients.carbsMg > 100000
    || (value.barcode !== undefined && (typeof value.barcode !== 'string' || normalizeFoodBarcode(value.barcode)?.lookupCode !== value.barcode))) return { ok: false, error: 'invalidFood' };
  return { ok: true, value: { name: value.name, ...(value.brand ? { brand: value.brand } : {}), ...(value.barcode ? { barcode: value.barcode } : {}), nutrients: { energyCentiKcal: value.nutrients.energyCentiKcal, proteinMg: value.nutrients.proteinMg, fatMg: value.nutrients.fatMg, carbsMg: value.nutrients.carbsMg } } };
}
export function parsePersonalFood(value: unknown): PersonalFoodResult<PersonalFood> {
  const input = parsePersonalFoodInput(value);
  if (!input.ok || !isObject(value) || !isPersonalFoodId(value.id) || !isTimestamp(value.createdAt)
    || !isTimestamp(value.updatedAt) || Date.parse(value.updatedAt) < Date.parse(value.createdAt)) return { ok: false, error: 'invalidFood' };
  return { ok: true, value: { ...input.value, id: value.id, createdAt: value.createdAt, updatedAt: value.updatedAt } };
}
export function personalFoodToCatalog(food: PersonalFood): CatalogFood {
  return { source: { providerId: personalFoodProviderId, foodId: food.id }, name: food.name, basis: 'per100g', nutrients: { ...food.nutrients },
    ...(food.brand ? { brand: food.brand } : {}), ...(food.barcode ? { barcode: food.barcode } : {}) };
}
export function searchPersonalFoods(foods: readonly PersonalFood[], query: string): readonly PersonalFood[] {
  const normalized = query.trim().toLowerCase();
  const rank = (food: PersonalFood) => {
    const name = food.name.toLowerCase(), brand = food.brand?.toLowerCase() ?? '';
    return !normalized || name.startsWith(normalized) ? 0 : name.includes(normalized) ? 1 : brand.includes(normalized) ? 2 : 3;
  };
  return foods.filter(food => rank(food) < 3).sort((a, b) => rank(a) - rank(b) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || a.id.localeCompare(b.id));
}
/** Detached recent data never overrides the canonical personal catalog; deleted references disappear. */
export function reconcilePersonalRecents(recents: readonly RecentFood[], foods: readonly PersonalFood[]): readonly RecentFood[] {
  const current = new Map(foods.map(food => [food.id, food]));
  return recents.flatMap(item => item.food.source.providerId !== personalFoodProviderId ? [item]
    : current.has(item.food.source.foodId) ? [{ ...item, food: personalFoodToCatalog(current.get(item.food.source.foodId)!) }] : []);
}
