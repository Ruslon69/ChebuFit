import type { DailyNutritionDiary, FoodId, FoodSnapshot, LocalDateKey, MealType, NutritionDiaryEntry, NutritionEntryId } from '../domain/types';

// Explicit demo foods, not an aggregate-total shortcut or external product catalog.
const foods = {
  oats: ['Овсяные хлопья', 370, 13, 7, 60],
  eggs: ['Яйца', 143, 13, 10, 1],
  banana: ['Банан', 89, 1.1, 0.3, 22.8],
  chicken: ['Куриная грудка', 165, 31, 3.6, 0],
  rice: ['Рис отварной', 130, 2.7, 0.3, 28],
  oil: ['Оливковое масло', 884, 0, 100, 0],
  salmon: ['Лосось', 208, 20, 13, 0],
  potato: ['Картофель', 80, 2, 0.1, 17],
  vegetables: ['Овощи', 35, 2, 0.2, 6],
  yogurt: ['Греческий йогурт', 65, 10, 0, 4],
} as const;
const portions: readonly [MealType, keyof typeof foods, number][] = [
  ['breakfast', 'oats', 60], ['breakfast', 'eggs', 100], ['breakfast', 'banana', 170],
  ['lunch', 'chicken', 143], ['lunch', 'rice', 270], ['lunch', 'oil', 10.5],
  ['dinner', 'salmon', 115], ['dinner', 'potato', 320], ['dinner', 'vegetables', 150],
  ['snacks', 'yogurt', 200], ['snacks', 'banana', 80],
];
export function createDevelopmentDiary(localDate: LocalDateKey, now: string): DailyNutritionDiary {
  const entries = portions.map(([meal, key, grams], index): NutritionDiaryEntry => {
    const [name, kcal, protein, fat, carbs] = foods[key];
    const food: FoodSnapshot = { foodId: `demo-${key}` as FoodId, name, source: { provider: 'chebufit-demo' }, basis: 'per100g',
      nutrients: { energyCentiKcal: Math.round(kcal * 100), proteinMg: Math.round(protein * 1000), fatMg: Math.round(fat * 1000), carbsMg: Math.round(carbs * 1000) } };
    return { id: `demo:${localDate}:${index}` as NutritionEntryId, localDate, meal, food,
      quantity: { unit: 'g', milliGrams: Math.round(grams * 1000) }, createdAt: now, updatedAt: now };
  });
  return { localDate, entries, createdAt: now, updatedAt: now };
}
