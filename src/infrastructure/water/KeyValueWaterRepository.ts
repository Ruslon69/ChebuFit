import type { WaterResult } from '../../features/water/domain/types';
import { decodeWaterState, type WaterMode, type WaterStateV1 } from '../../features/water/application/WaterState';
import type { WaterRepository } from '../../features/water/application/WaterRepository';

export interface WaterKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export function createKeyValueWaterRepository(storage: WaterKeyValueStorage, mode: WaterMode): WaterRepository {
  const identity = `@chebufit/water/${mode}`;
  return {
    identity, mode,
    async load(): Promise<WaterResult<WaterStateV1 | null>> {
      let raw: string | null;
      try { raw = await storage.getItem(identity); } catch { return { ok: false, error: 'storageUnavailable' }; }
      if (raw === null) return { ok: true, value: null };
      let data: unknown;
      try { data = JSON.parse(raw); } catch { return { ok: false, error: 'corruptData' }; }
      return decodeWaterState(data, mode);
    },
    async save(state) {
      const decoded = decodeWaterState(state, mode);
      if (!decoded.ok) return decoded;
      try { await storage.setItem(identity, JSON.stringify(decoded.value)); } catch { return { ok: false, error: 'storageUnavailable' }; }
      return { ok: true, value: undefined };
    },
  };
}
