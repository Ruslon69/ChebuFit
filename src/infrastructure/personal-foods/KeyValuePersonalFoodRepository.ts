import { decodePersonalFoodState, type PersonalFoodMode, type PersonalFoodRepository } from '../../features/personal-foods/application/PersonalFoodRepository';
type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> };
export function createKeyValuePersonalFoodRepository(storage: Storage, mode: PersonalFoodMode): PersonalFoodRepository {
  const identity = `@chebufit/personal-foods/${mode}`;
  return {
    identity, mode,
    async load() {
      let raw: string | null;
      try { raw = await storage.getItem(identity); } catch { return { ok: false, error: 'storageUnavailable' }; }
      if (raw === null) return { ok: true, value: null };
      let state: unknown; try { state = JSON.parse(raw); } catch { return { ok: false, error: 'corruptData' }; }
      return decodePersonalFoodState(state, mode);
    },
    async save(state) {
      const parsed = decodePersonalFoodState(state, mode); if (!parsed.ok) return parsed;
      try { await storage.setItem(identity, JSON.stringify(parsed.value)); return { ok: true, value: undefined }; }
      catch { return { ok: false, error: 'storageUnavailable' }; }
    },
  };
}
