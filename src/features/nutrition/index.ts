export type { NutritionEntryId, FoodId, LocalDateKey, MealType, FoodSnapshot, GramQuantity, Nutrients,
  NutritionDiaryEntry, DailyNutritionDiary, NutritionTargets, NutritionSummary, DailyNutritionView,
  NutritionError, NutritionResult, NutritionEntryAdded, NutritionChange } from './domain/types';
export { mealTypes } from './domain/types';
export { defaultNutritionTargets, quantityFromGrams, parseFoodSnapshot, entryNutrition, sumNutrients, calculateNutritionSummary } from './domain/nutrition';
export { createNutritionService } from './application/NutritionService';
export type { NutritionService } from './application/NutritionService';
export type { NutritionRepository } from './application/NutritionRepository';
export { createInitialNutritionState, decodeNutritionState } from './application/NutritionState';
export type { NutritionStateV1, NutritionMode } from './application/NutritionState';
export { toNutritionOverview } from './model/NutritionOverview';
export type { NutritionOverview } from './model/NutritionOverview';
