import { isTimestamp } from '../../nutrition/domain/nutrition';
import { isPersonalFoodId, parsePersonalFoodInput, personalBarcodeIdentity, searchPersonalFoods, type PersonalFood, type PersonalFoodInput, type PersonalFoodResult } from '../domain/personalFood';
import type { PersonalFoodRepository, PersonalFoodStateV1 } from './PersonalFoodRepository';

type Scope = { tail: Promise<void>; listeners: Set<() => void> };
const scopes = new Map<string, Scope>();
export function createPersonalFoodService(repository: PersonalFoodRepository, options: { now: () => string; nextId: () => string }) {
  let scope = scopes.get(repository.identity);
  if (!scope) { scope = { tail: Promise.resolve(), listeners: new Set() }; scopes.set(repository.identity, scope); }
  const shared = scope;
  const serial = <T,>(operation: () => Promise<PersonalFoodResult<T>>): Promise<PersonalFoodResult<T>> => {
    const task = shared.tail.then(operation).catch((): PersonalFoodResult<T> => ({ ok: false, error: 'storageUnavailable' }));
    shared.tail = task.then(() => undefined); return task;
  };
  const read = async (): Promise<PersonalFoodResult<PersonalFoodStateV1>> => {
    const result = await repository.load();
    return result.ok ? { ok: true, value: result.value ?? { schemaVersion: 1, mode: repository.mode, foods: [] } } : result;
  };
  const publish = () => { for (const listener of shared.listeners) { try { listener(); } catch { /* post-commit subscriber isolation */ } } };
  const mutate = (input: PersonalFoodInput, id?: string): Promise<PersonalFoodResult<PersonalFood>> => {
    const parsed = parsePersonalFoodInput(input); // detach at call time
    if (!parsed.ok) return Promise.resolve(parsed);
    return serial(async () => {
      const loaded = await read(); if (!loaded.ok) return loaded;
      const previous = id === undefined ? undefined : loaded.value.foods.find(food => food.id === id);
      if (id !== undefined && !previous) return { ok: false, error: 'notFound' };
      const identity = parsed.value.barcode ? personalBarcodeIdentity(parsed.value.barcode) : null;
      const duplicate = identity && loaded.value.foods.find(food => food.id !== id && food.barcode && personalBarcodeIdentity(food.barcode) === identity);
      if (duplicate) return { ok: false, error: 'duplicateBarcode', existing: duplicate };
      const generatedId = previous?.id ?? options.nextId();
      if (!isPersonalFoodId(generatedId) || (!previous && loaded.value.foods.some(food => food.id === generatedId))) return { ok: false, error: 'duplicateId' };
      const clock = options.now(); if (!isTimestamp(clock)) return { ok: false, error: 'invalidTimestamp' };
      const now = previous && Date.parse(clock) < Date.parse(previous.updatedAt) ? previous.updatedAt : clock;
      const food: PersonalFood = { ...parsed.value, id: generatedId, createdAt: previous?.createdAt ?? now, updatedAt: now };
      const foods = previous ? loaded.value.foods.map(item => item.id === id ? food : item) : [...loaded.value.foods, food];
      const saved = await repository.save({ ...loaded.value, foods }); if (!saved.ok) return saved;
      publish(); return { ok: true, value: food };
    });
  };
  return {
    subscribe(listener: () => void) { shared.listeners.add(listener); return () => { shared.listeners.delete(listener); }; },
    getAll(): Promise<PersonalFoodResult<readonly PersonalFood[]>> { return serial(async () => { const state = await read(); return state.ok ? { ok: true, value: state.value.foods } : state; }); },
    getById(id: string): Promise<PersonalFoodResult<PersonalFood | null>> { return serial(async () => { const state = await read(); return state.ok ? { ok: true, value: state.value.foods.find(food => food.id === id) ?? null } : state; }); },
    getByBarcode(code: string): Promise<PersonalFoodResult<PersonalFood | null>> {
      const identity = personalBarcodeIdentity(code);
      if (!identity) return Promise.resolve({ ok: false, error: 'invalidFood' });
      return serial(async () => { const state = await read(); return state.ok ? { ok: true, value: state.value.foods.find(food => food.barcode && personalBarcodeIdentity(food.barcode) === identity) ?? null } : state; });
    },
    search(query: string): Promise<PersonalFoodResult<readonly PersonalFood[]>> { return serial(async () => { const state = await read(); return state.ok ? { ok: true, value: searchPersonalFoods(state.value.foods, query) } : state; }); },
    create(input: PersonalFoodInput) { return mutate(input); },
    update(id: string, input: PersonalFoodInput) { return mutate(input, id); },
    delete(id: string): Promise<PersonalFoodResult<void>> { return serial(async () => {
      const state = await read(); if (!state.ok) return state;
      if (!state.value.foods.some(food => food.id === id)) return { ok: false, error: 'notFound' };
      const saved = await repository.save({ ...state.value, foods: state.value.foods.filter(food => food.id !== id) });
      if (!saved.ok) return saved; publish(); return { ok: true, value: undefined };
    }); },
  };
}
export type PersonalFoodService = ReturnType<typeof createPersonalFoodService>;
