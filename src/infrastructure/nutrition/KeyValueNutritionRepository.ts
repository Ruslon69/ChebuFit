import type { NutritionResult } from '../../features/nutrition/domain/types';
import type { NutritionRepository } from '../../features/nutrition/application/NutritionRepository';
import { decodeNutritionState, type NutritionMode, type NutritionStateV1 } from '../../features/nutrition/application/NutritionState';
export interface NutritionKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export function createKeyValueNutritionRepository(storage: NutritionKeyValueStorage, mode: NutritionMode): NutritionRepository {
  const identity = `@chebufit/nutrition/${mode}`;
  return {
    identity, mode,
    async load(): Promise<NutritionResult<NutritionStateV1 | null>> {
      let raw: string | null;
      try { raw = await storage.getItem(identity); } catch { return { ok: false, error: 'storageUnavailable' }; }
      if (raw === null) return { ok: true, value: null };
      let data: unknown;
      try { data = JSON.parse(raw); } catch { return { ok: false, error: 'corruptData' }; }
      return decodeNutritionState(data, mode);
    },
    async save(state) {
      const valid = decodeNutritionState(state, mode);
      if (!valid.ok) return valid;
      try { await storage.setItem(identity, JSON.stringify(valid.value)); } catch { return { ok: false, error: 'storageUnavailable' }; }
      return { ok: true, value: undefined };
    },
  };
}
