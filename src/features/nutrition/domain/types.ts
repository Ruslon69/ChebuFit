import type { LocalDateKey } from '../../../shared/utils/localCalendar';
export type { LocalDateKey } from '../../../shared/utils/localCalendar';
declare const entryId: unique symbol;
declare const foodId: unique symbol;
export type NutritionEntryId = string & { readonly [entryId]: true };
export type FoodId = string & { readonly [foodId]: true };
export const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;
export type MealType = typeof mealTypes[number];
/** Canonical scaled integers, never display kcal/gram floats. */
export type Nutrients = Readonly<{ energyCentiKcal: number; proteinMg: number; fatMg: number; carbsMg: number }>;
export type NutritionTargets = Nutrients;
export type FoodSnapshot = Readonly<{
  foodId: FoodId;
  name: string;
  brand?: string;
  source?: Readonly<{ provider: string; externalId?: string; barcode?: string }>;
  basis: 'per100g';
  nutrients: Nutrients;
}>;
/** Future serving adapters resolve an amount to grams before diary math. */
export type GramQuantity = Readonly<{ unit: 'g'; milliGrams: number }>;
export type NutritionDiaryEntry = Readonly<{
  id: NutritionEntryId;
  localDate: LocalDateKey;
  meal: MealType;
  food: FoodSnapshot;
  quantity: GramQuantity;
  createdAt: string;
  updatedAt: string;
}>;
export type DailyNutritionDiary = Readonly<{
  localDate: LocalDateKey;
  entries: readonly NutritionDiaryEntry[];
  createdAt: string;
  updatedAt: string;
}>;
export type NutritionSummary = Readonly<{
  totals: Nutrients;
  meals: Readonly<Record<MealType, Nutrients>>;
  remaining: Nutrients;
}>;
export type DailyNutritionView = Readonly<{ diary: DailyNutritionDiary; targets: NutritionTargets; summary: NutritionSummary }>;
export type NutritionError = 'invalidQuantity' | 'invalidMeal' | 'invalidSnapshot' | 'invalidTargets' | 'invalidLocalDate'
  | 'invalidTimestamp' | 'invalidEntryId' | 'duplicateEntryId' | 'entryNotFound' | 'nutritionOverflow'
  | 'corruptData' | 'unsupportedSchema' | 'storageUnavailable' | 'resetDisabled';
export type NutritionResult<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; error: NutritionError }>;
/** Future reward producers can consume this only after a real add commits. No producer is connected yet. */
export type NutritionEntryAdded = Readonly<{ type: 'entryAdded'; entryId: NutritionEntryId; localDate: LocalDateKey; meal: MealType; occurredAt: string }>;
export type NutritionChange = Readonly<{ entry: NutritionDiaryEntry | null; view: DailyNutritionView; fact: NutritionEntryAdded | null }>;
