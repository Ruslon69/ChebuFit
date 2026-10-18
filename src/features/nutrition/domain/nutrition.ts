import type { FoodId, FoodSnapshot, GramQuantity, MealType, Nutrients, NutritionDiaryEntry, NutritionResult, NutritionSummary, NutritionTargets } from './types';
import { mealTypes } from './types';

export const nutrientKeys = ['energyCentiKcal', 'proteinMg', 'fatMg', 'carbsMg'] as const;
export const defaultNutritionTargets: NutritionTargets = { energyCentiKcal: 284500, proteinMg: 185000, fatMg: 65000, carbsMg: 380000 };
export const emptyNutrients = (): Nutrients => ({ energyCentiKcal: 0, proteinMg: 0, fatMg: 0, carbsMg: 0 });
export const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
export const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
export const isTimestamp = (value: unknown): value is string => typeof value === 'string' && /(Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
export const isMealType = (value: unknown): value is MealType => mealTypes.some(meal => meal === value);
export function isNutrients(value: unknown): value is Nutrients {
  return isObject(value) && nutrientKeys.every(key => typeof value[key] === 'number' && Number.isSafeInteger(value[key]) && value[key] >= 0);
}
export const isTargets = (value: unknown): value is NutritionTargets => isNutrients(value) && value.energyCentiKcal > 0;
export const isGramQuantity = (value: unknown): value is GramQuantity => isObject(value) && value.unit === 'g'
  && typeof value.milliGrams === 'number' && Number.isSafeInteger(value.milliGrams) && value.milliGrams > 0;

/** Round once to the nearest milligram at the quantity boundary. */
export function quantityFromGrams(grams: number): NutritionResult<GramQuantity> {
  if (typeof grams !== 'number' || !Number.isFinite(grams) || grams <= 0) return { ok: false, error: 'invalidQuantity' };
  const milliGrams = Math.round(grams * 1000);
  return Number.isSafeInteger(milliGrams) && milliGrams > 0
    ? { ok: true, value: { unit: 'g', milliGrams } } : { ok: false, error: 'invalidQuantity' };
}

/** Copy validated provider-neutral data, detaching the snapshot from mutable source objects. */
export function parseFoodSnapshot(value: unknown): NutritionResult<FoodSnapshot> {
  const invalid = { ok: false, error: 'invalidSnapshot' } as const;
  if (!isObject(value) || !isText(value.foodId) || !isText(value.name) || value.basis !== 'per100g' || !isNutrients(value.nutrients)) return invalid;
  if (value.brand !== undefined && !isText(value.brand)) return invalid;
  let source: FoodSnapshot['source'];
  if (value.source !== undefined) {
    if (!isObject(value.source) || !isText(value.source.provider)
      || (value.source.externalId !== undefined && !isText(value.source.externalId))
      || (value.source.barcode !== undefined && !isText(value.source.barcode))) return invalid;
    source = { provider: value.source.provider, ...(value.source.externalId === undefined ? {} : { externalId: value.source.externalId }), ...(value.source.barcode === undefined ? {} : { barcode: value.source.barcode }) };
  }
  return { ok: true, value: { foodId: value.foodId as FoodId, name: value.name,
    ...(value.brand === undefined ? {} : { brand: value.brand }), ...(source === undefined ? {} : { source }),
    basis: 'per100g', nutrients: { energyCentiKcal: value.nutrients.energyCentiKcal, proteinMg: value.nutrients.proteinMg, fatMg: value.nutrients.fatMg, carbsMg: value.nutrients.carbsMg } } };
}

export function entryNutrition(entry: Pick<NutritionDiaryEntry, 'food' | 'quantity'>): NutritionResult<Nutrients> {
  const food = parseFoodSnapshot(entry.food);
  if (!food.ok) return food;
  if (!isGramQuantity(entry.quantity)) return { ok: false, error: 'invalidQuantity' };
  const values = {} as Record<typeof nutrientKeys[number], number>;
  for (const key of nutrientKeys) {
    // Exact rational per-100g multiplication; round half up to the canonical unit.
    const result = (BigInt(food.value.nutrients[key]) * BigInt(entry.quantity.milliGrams) + 50000n) / 100000n;
    if (result > BigInt(Number.MAX_SAFE_INTEGER)) return { ok: false, error: 'nutritionOverflow' };
    values[key] = Number(result);
  }
  return { ok: true, value: values };
}
export function sumNutrients(values: readonly Nutrients[]): NutritionResult<Nutrients> {
  const total = { ...emptyNutrients() };
  for (const value of values) {
    if (!isNutrients(value)) return { ok: false, error: 'nutritionOverflow' };
    for (const key of nutrientKeys) {
      if (!Number.isSafeInteger(total[key] + value[key])) return { ok: false, error: 'nutritionOverflow' };
      total[key] += value[key];
    }
  }
  return { ok: true, value: total };
}
export function calculateNutritionSummary(entries: readonly NutritionDiaryEntry[], targets: NutritionTargets): NutritionResult<NutritionSummary> {
  if (!isTargets(targets)) return { ok: false, error: 'invalidTargets' };
  const buckets: Record<MealType, Nutrients[]> = { breakfast: [], lunch: [], dinner: [], snacks: [] };
  for (const entry of entries) {
    if (!isMealType(entry.meal)) return { ok: false, error: 'invalidMeal' };
    const calculated = entryNutrition(entry);
    if (!calculated.ok) return calculated;
    buckets[entry.meal].push(calculated.value);
  }
  const meals = {} as Record<MealType, Nutrients>;
  for (const meal of mealTypes) {
    const total = sumNutrients(buckets[meal]);
    if (!total.ok) return total;
    meals[meal] = total.value;
  }
  const totals = sumNutrients(mealTypes.map(meal => meals[meal]));
  if (!totals.ok) return totals;
  const remaining = { ...emptyNutrients() };
  for (const key of nutrientKeys) remaining[key] = Math.max(0, targets[key] - totals.value[key]);
  return { ok: true, value: { totals: totals.value, meals, remaining } };
}
