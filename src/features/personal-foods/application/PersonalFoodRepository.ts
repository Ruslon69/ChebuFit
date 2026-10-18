import { isObject } from '../../nutrition/domain/nutrition';
import { parsePersonalFood, personalBarcodeIdentity, type PersonalFood, type PersonalFoodResult } from '../domain/personalFood';

export type PersonalFoodMode = 'real' | 'developmentDemo';
export type PersonalFoodStateV1 = Readonly<{ schemaVersion: 1; mode: PersonalFoodMode; foods: readonly PersonalFood[] }>;
export interface PersonalFoodRepository {
  readonly identity: string;
  readonly mode: PersonalFoodMode;
  load(): Promise<PersonalFoodResult<PersonalFoodStateV1 | null>>;
  save(state: PersonalFoodStateV1): Promise<PersonalFoodResult<void>>;
}
export function decodePersonalFoodState(data: unknown, mode: PersonalFoodMode): PersonalFoodResult<PersonalFoodStateV1> {
  const corrupt = { ok: false, error: 'corruptData' } as const;
  if (!isObject(data) || !('schemaVersion' in data)) return corrupt;
  if (data.schemaVersion !== 1) return { ok: false, error: 'unsupportedSchema' };
  if (data.mode !== mode || !Array.isArray(data.foods)) return corrupt;
  const foods: PersonalFood[] = [], ids = new Set<string>(), barcodes = new Set<string>();
  for (const value of data.foods) {
    const food = parsePersonalFood(value);
    if (!food.ok || ids.has(food.value.id)) return corrupt;
    const barcode = food.value.barcode ? personalBarcodeIdentity(food.value.barcode) : null;
    if (barcode && barcodes.has(barcode)) return corrupt;
    ids.add(food.value.id); if (barcode) barcodes.add(barcode); foods.push(food.value);
  }
  return { ok: true, value: { schemaVersion: 1, mode, foods } };
}
