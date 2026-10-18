import type { DailyNutritionView } from '../domain/types';
import { mealTypes } from '../domain/types';

/** Display rounding only; authoritative fixed-precision totals remain in the view. */
export function toNutritionOverview(view: DailyNutritionView) {
  const { totals, remaining } = view.summary, targets = view.targets;
  return {
    calories: { consumed: Math.round(totals.energyCentiKcal / 100), target: Math.round(targets.energyCentiKcal / 100), remaining: Math.round(remaining.energyCentiKcal / 100) },
    macros: ([['protein', 'proteinMg'], ['fat', 'fatMg'], ['carbs', 'carbsMg']] as const).map(([id, key]) => ({
      id, consumed: Math.round(totals[key] / 1000), target: Math.round(targets[key] / 1000), remaining: Math.round(remaining[key] / 1000),
    })),
    meals: mealTypes.map(id => ({ id, calories: Math.round(view.summary.meals[id].energyCentiKcal / 100) })),
  };
}
export type NutritionOverview = ReturnType<typeof toNutritionOverview>;
