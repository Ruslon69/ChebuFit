import type { MealType, NutritionOverview } from '../../nutrition';

export type MacroId = 'protein' | 'fat' | 'carbs';
export type MealId = MealType;

// Presentation data only. A future adapter can produce this without changing the UI.
export type TodayViewModel = {
  greeting: 'morning' | 'afternoon' | 'evening';
  name: string;
  date: string;
  orangeBalance: number | null;
  nutrition: NutritionOverview | null;
  water: { consumedMl: number | null; targetMl: number | null; portionMl: number };
  workout: { title: string; exerciseCount: number; durationMinutes: number };
  weight: { kg: number; changeKg: number; periodDays: number; changeTone: 'positive' | 'neutral' };
};
