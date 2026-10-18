import { catalogFoodIdentity, parseCatalogFood } from '../../features/food-catalog/domain/catalogFood';
import type { CatalogResult, RecentFood, RecentFoodsRepository } from '../../features/food-catalog/domain/types';
import { isTimestamp } from '../../features/nutrition/domain/nutrition';

type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> };
const queues = new Map<string, Promise<void>>();
export function createKeyValueRecentFoodsRepository(storage: Storage, mode: 'real' | 'developmentDemo'): RecentFoodsRepository {
  const key = `@chebufit/recent-foods/${mode}`;
  const load = async (): Promise<CatalogResult<readonly RecentFood[]>> => {
    try {
      const raw = await storage.getItem(key);
      if (raw === null) return { ok: true, value: [] };
      const state: unknown = JSON.parse(raw);
      if (!state || typeof state !== 'object' || !('schemaVersion' in state)) return { ok: false, error: 'corruptData' };
      if (state.schemaVersion !== 1) return { ok: false, error: 'unsupportedSchema' };
      if (!('foods' in state) || !Array.isArray(state.foods) || state.foods.length > 30) return { ok: false, error: 'corruptData' };
      const foods: RecentFood[] = [], ids = new Set<string>();
      for (const item of state.foods) {
        if (!item || !isTimestamp(item.addedAt)) return { ok: false, error: 'corruptData' };
        const food = parseCatalogFood(item.food);
        if (!food.ok || ids.has(catalogFoodIdentity(food.value))) return { ok: false, error: 'corruptData' };
        ids.add(catalogFoodIdentity(food.value)); foods.push({ food: food.value, addedAt: item.addedAt });
      }
      return { ok: true, value: foods };
    } catch (error) { return { ok: false, error: error instanceof SyntaxError ? 'corruptData' : 'storageUnavailable' }; }
  };
  return {
    load,
    record(food, addedAt) {
      const captured = parseCatalogFood(food);
      if (!captured.ok || !isTimestamp(addedAt)) return Promise.resolve({ ok: false, error: 'invalidFood' });
      const operation = (queues.get(key) ?? Promise.resolve()).then(async (): Promise<CatalogResult<void>> => {
        const previous = await load(); if (!previous.ok) return previous;
        const foods = [{ food: captured.value, addedAt }, ...previous.value.filter(item => catalogFoodIdentity(item.food) !== catalogFoodIdentity(captured.value))].slice(0, 30);
        try { await storage.setItem(key, JSON.stringify({ schemaVersion: 1, foods })); return { ok: true, value: undefined }; }
        catch { return { ok: false, error: 'storageUnavailable' }; }
      });
      queues.set(key, operation.then(() => undefined, () => undefined));
      return operation;
    },
  };
}
