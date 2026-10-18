import { isObject } from '../../features/nutrition/domain/nutrition';
import type { CatalogFood } from '../../features/food-catalog/domain/types';

export const offProviderId = 'open-food-facts';
// Accept GTIN-8, UPC-A, EAN-13 and GTIN-14, preserving leading zeroes.
// No checksum gate: community catalogues also contain assigned/internal codes.
export const isOffBarcode = (value: unknown): value is string => typeof value === 'string' && /^(?:\d{8}|\d{12,14})$/.test(value) && !/^0+$/.test(value);
const text = (value: unknown, max = 500): string | undefined => {
  if (typeof value !== 'string') return;
  const clean = value.replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean || clean.length > max || /^(?:null|undefined|[a-z]{2}:[\w-]+)$/i.test(clean)) return;
  return clean;
};
const numeric = (value: unknown, max: number): number | null => {
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+(?:\.\d+)?$/.test(value.trim()))) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
};

/** OFF wire data ends here. Missing nutrients are never interpreted as zero. */
export function mapOpenFoodFactsProduct(value: unknown, languages: readonly string[]): CatalogFood | null {
  if (!isObject(value) || !isOffBarcode(value.code)) return null;
  const name = [...languages.map(language => text(value[`product_name_${language}`])), text(value.product_name),
    text(value.product_name_en), text(value.generic_name)].find(Boolean);
  if (!name) return null;
  let kcal: number | null, protein: number | null, fat: number | null, carbs: number | null;
  if (value.nutrition !== undefined) {
    // API v3.5+: normalized aggregate. Never mix sources/units or prepared profiles.
    const set = isObject(value.nutrition) ? value.nutrition.aggregated_set : null;
    if (!isObject(set) || set.per !== '100g' || set.preparation !== 'as_sold' || !isObject(set.nutrients)) return null;
    const nutrients = set.nutrients;
    const read = (key: string, unit: string, max: number) => {
      const nutrient = nutrients[key];
      return isObject(nutrient) && nutrient.unit === unit && nutrient.modifier === undefined
        ? numeric(nutrient.value, max) : null;
    };
    kcal = read('energy-kcal', 'kcal', 1000);
    protein = read('proteins', 'g', 100); fat = read('fat', 'g', 100); carbs = read('carbohydrates', 'g', 100);
  } else {
    // Legacy search still returns normalized unprepared *_100g. Energy alone is kJ.
    if (!isObject(value.nutriments)) return null;
    if (value.nutrition_data_per !== undefined && !['100g', 'serving'].includes(String(value.nutrition_data_per))) return null;
    if (['ml', 'cl', 'dl', 'l'].includes(String(value.product_quantity_unit).toLowerCase())
      || ['ml', 'cl', 'dl', 'l'].includes(String(value.serving_quantity_unit).toLowerCase())
      || (typeof value.quantity === 'string' && /\d\s*(?:ml|cl|dl|l)\b/i.test(value.quantity))) return null;
    const n = value.nutriments;
    for (const key of ['proteins', 'fat', 'carbohydrates', 'energy-kcal']) {
      if (n[`${key}_modifier`] !== undefined && n[`${key}_modifier`] !== '') return null;
      if (n[`${key}_unit`] !== undefined && n[`${key}_unit`] !== (key === 'energy-kcal' ? 'kcal' : 'g')) return null;
    }
    kcal = numeric(n['energy-kcal_100g'], 1000);
    protein = numeric(n.proteins_100g, 100); fat = numeric(n.fat_100g, 100); carbs = numeric(n.carbohydrates_100g, 100);
  }
  if (kcal === null || protein === null || fat === null || carbs === null || protein + fat + carbs > 105) return null;
  const brand = text(value.brands);
  // Serving sizes are retained only with an explicit gram unit, never guessed.
  const servingGrams = value.serving_quantity_unit === 'g' ? numeric(value.serving_quantity, 10000) : null;
  const servingLabel = text(value.serving_size, 120);
  return {
    source: { providerId: offProviderId, foodId: value.code }, barcode: value.code, name,
    ...(brand ? { brand } : {}), basis: 'per100g',
    nutrients: { energyCentiKcal: Math.round(kcal * 100), proteinMg: Math.round(protein * 1000), fatMg: Math.round(fat * 1000), carbsMg: Math.round(carbs * 1000) },
    ...(servingGrams && servingLabel ? { serving: { label: servingLabel, grams: servingGrams } } : {}),
  };
}
