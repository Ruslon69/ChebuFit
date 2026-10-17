export type MacroId = 'protein' | 'fat' | 'carbs';
export type MealId = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

// Presentation data only. A future adapter can produce this without changing the UI.
export type TodayViewModel = {
  greeting: 'morning' | 'afternoon' | 'evening';
  name: string;
  date: string;
  orangeBalance: number;
  calories: { consumed: number; target: number };
  macros: ReadonlyArray<{ id: MacroId; consumed: number; target: number }>;
  water: { consumedMl: number; targetMl: number; portionMl: number };
  meals: ReadonlyArray<{ id: MealId; calories: number }>;
  workout: { title: string; exerciseCount: number; durationMinutes: number };
  weight: { kg: number; changeKg: number; periodDays: number; changeTone: 'positive' | 'neutral' };
};
