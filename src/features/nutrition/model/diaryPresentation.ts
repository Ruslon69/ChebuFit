import { isLocalDateKey, type LocalDateKey } from '../../../shared/utils/localCalendar';
import { entryNutrition, isMealType, quantityFromGrams } from '../domain/nutrition';
import { mealTypes, type DailyNutritionView, type MealType } from '../domain/types';

/** UTC is used only for date-only arithmetic, never to infer a user's local day. */
export function shiftDiaryDate(date: LocalDateKey, days: number): LocalDateKey {
  if (!isLocalDateKey(date) || !Number.isInteger(days)) throw new Error('Invalid calendar date');
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  const key = value.toISOString().slice(0, 10);
  if (!isLocalDateKey(key)) throw new Error('Calendar date out of range');
  return key;
}
export function parseQuantityDraft(text: string): number | null {
  if (!/^\d+(?:[.,]\d{1,3})?$/.test(text.trim())) return null;
  const grams = Number(text.trim().replace(',', '.'));
  return quantityFromGrams(grams).ok ? grams : null;
}
export function addFoodRoute(date: LocalDateKey, meal: MealType) {
  return { pathname: '/add-food' as const, params: { date, meal } };
}
export function parseAddFoodContext(params: { date?: unknown; meal?: unknown }, today: LocalDateKey) {
  return isLocalDateKey(params.date) && params.date <= today && isMealType(params.meal)
    ? { date: params.date, meal: params.meal } : null;
}
export function toDiaryMeals(view: DailyNutritionView) {
  return mealTypes.map(meal => ({
    meal, calories: view.summary.meals[meal].energyCentiKcal / 100,
    entries: view.diary.entries.filter(entry => entry.meal === meal).map(entry => {
      const totals = entryNutrition(entry);
      if (!totals.ok) throw new Error('Invalid authoritative diary entry');
      return { entry, grams: entry.quantity.milliGrams / 1000, calories: totals.value.energyCentiKcal / 100 };
    }),
  }));
}
