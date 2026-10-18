import type { PersonalFood, PersonalFoodInput } from '../domain/personalFood';
import { normalizeFoodBarcode } from '../../food-catalog/domain/barcode';

export const personalFoodFields = ['name', 'brand', 'energy', 'protein', 'fat', 'carbs', 'barcode'] as const;
export type PersonalFoodField = typeof personalFoodFields[number];
export type PersonalFoodDraft = Record<PersonalFoodField, string>;
export type PersonalFoodFormErrors = Partial<Record<PersonalFoodField, true>>;
/** Exact decimal parsing into existing scaled integers, with no intermediate floating-point nutrition. */
export function parseNutrientDraft(raw: string, places: number, maximum: number): number | null {
  const text = raw.trim().replace(',', '.');
  if (!new RegExp(`^(?:\\d+(?:\\.\\d{1,${places}})?|\\.\\d{1,${places}})$`).test(text) || text.length > 16) return null;
  const [whole, fraction = ''] = text.split('.');
  const value = BigInt(whole || '0') * 10n ** BigInt(places) + BigInt(fraction.padEnd(places, '0'));
  return value <= BigInt(maximum) ? Number(value) : null;
}
export function personalFoodDraft(food?: PersonalFood, barcode = ''): PersonalFoodDraft {
  const text = (value: number, factor: number) => String(value / factor).replace('.', ',');
  return { name: food?.name ?? '', brand: food?.brand ?? '', barcode: food?.barcode ?? barcode,
    energy: food ? text(food.nutrients.energyCentiKcal, 100) : '', protein: food ? text(food.nutrients.proteinMg, 1000) : '',
    fat: food ? text(food.nutrients.fatMg, 1000) : '', carbs: food ? text(food.nutrients.carbsMg, 1000) : '' };
}
export function validatePersonalFoodDraft(draft: PersonalFoodDraft): { ok: true; value: PersonalFoodInput } | { ok: false; errors: PersonalFoodFormErrors } {
  const errors: PersonalFoodFormErrors = {}, name = draft.name.trim(), brand = draft.brand.trim(), rawBarcode = draft.barcode.trim();
  if (!name || name.length > 200 || /[\u0000-\u001f\u007f]/.test(name)) errors.name = true;
  if (brand.length > 120 || /[\u0000-\u001f\u007f]/.test(brand)) errors.brand = true;
  const energy = parseNutrientDraft(draft.energy, 2, 100000), protein = parseNutrientDraft(draft.protein, 3, 100000), fat = parseNutrientDraft(draft.fat, 3, 100000), carbs = parseNutrientDraft(draft.carbs, 3, 100000);
  if (energy === null) errors.energy = true; if (protein === null) errors.protein = true;
  if (fat === null) errors.fat = true; if (carbs === null) errors.carbs = true;
  const barcode = rawBarcode ? normalizeFoodBarcode(rawBarcode) : null;
  if (rawBarcode && !barcode) errors.barcode = true;
  if (energy === null || protein === null || fat === null || carbs === null || Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, ...(brand ? { brand } : {}), ...(barcode ? { barcode: barcode.lookupCode } : {}), nutrients: { energyCentiKcal: energy, proteinMg: protein, fatMg: fat, carbsMg: carbs } } };
}
