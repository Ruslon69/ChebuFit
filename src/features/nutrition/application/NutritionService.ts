import { isLocalDateKey } from '../../../shared/utils/localCalendar';
import type { DailyNutritionDiary, DailyNutritionView, FoodSnapshot, LocalDateKey, MealType, NutritionChange, NutritionDiaryEntry, NutritionEntryId, NutritionResult, NutritionTargets } from '../domain/types';
import { calculateNutritionSummary, isMealType, isTargets, isText, isTimestamp, parseFoodSnapshot, quantityFromGrams } from '../domain/nutrition';
import { createDevelopmentDiary } from '../model/developmentSeed';
import type { NutritionRepository } from './NutritionRepository';
import { createInitialNutritionState, type NutritionStateV1 } from './NutritionState';

type Listener = () => void;
type Scope = { tail: Promise<void>; listeners: Set<Listener> };
const scopes = new Map<string, Scope>();
function scopeFor(identity: string): Scope {
  let scope = scopes.get(identity);
  if (!scope) { scope = { tail: Promise.resolve(), listeners: new Set() }; scopes.set(identity, scope); }
  return scope;
}
export function createNutritionService(repository: NutritionRepository, options: { now: () => string; nextId: () => string; allowDevelopmentReset?: boolean }) {
  const scope = scopeFor(repository.identity);
  const serial = <T,>(operation: () => Promise<NutritionResult<T>>): Promise<NutritionResult<T>> => {
    const task = scope.tail.then(operation).catch((): NutritionResult<T> => ({ ok: false, error: 'storageUnavailable' }));
    scope.tail = task.then(() => undefined);
    return task;
  };
  const publish = () => { for (const listener of scope.listeners) { try { listener(); } catch { /* Subscriber isolation after commit. */ } } };
  const read = async (): Promise<NutritionResult<NutritionStateV1>> => {
    const loaded = await repository.load();
    return loaded.ok ? { ok: true, value: loaded.value ?? createInitialNutritionState(repository.mode) } : loaded;
  };
  const viewFor = (diary: DailyNutritionDiary, targets: NutritionTargets): NutritionResult<DailyNutritionView> => {
    const summary = calculateNutritionSummary(diary.entries, targets);
    return summary.ok ? { ok: true, value: { diary, targets, summary: summary.value } } : summary;
  };
  const ensureDay = (state: NutritionStateV1, localDate: LocalDateKey): NutritionResult<{ state: NutritionStateV1; diary: DailyNutritionDiary; created: boolean }> => {
    if (!isLocalDateKey(localDate)) return { ok: false, error: 'invalidLocalDate' };
    const existing = state.diaries.find(diary => diary.localDate === localDate);
    if (existing) return { ok: true, value: { state, diary: existing, created: false } };
    const now = options.now();
    if (!isTimestamp(now)) return { ok: false, error: 'invalidTimestamp' };
    const pendingSeed = state.developmentSeed?.localDate === null ? state.developmentSeed : null;
    const diary: DailyNutritionDiary = pendingSeed ? createDevelopmentDiary(localDate, now) : { localDate, entries: [], createdAt: now, updatedAt: now };
    return { ok: true, value: { diary, created: true, state: { ...state,
      developmentSeed: pendingSeed ? { ...pendingSeed, localDate } : state.developmentSeed, diaries: [...state.diaries, diary] } } };
  };
  type Edit = (diary: DailyNutritionDiary, now: string, state: NutritionStateV1) => NutritionResult<{ entries: readonly NutritionDiaryEntry[]; entry: NutritionDiaryEntry | null; added: boolean }>;
  const mutate = (localDate: LocalDateKey, edit: Edit): Promise<NutritionResult<NutritionChange>> => serial(async () => {
    const loaded = await read();
    if (!loaded.ok) return loaded;
    const day = ensureDay(loaded.value, localDate);
    if (!day.ok) return day;
    const clock = options.now();
    if (!isTimestamp(clock)) return { ok: false, error: 'invalidTimestamp' };
    const now = Date.parse(clock) < Date.parse(day.value.diary.updatedAt) ? day.value.diary.updatedAt : clock;
    const changed = edit(day.value.diary, now, day.value.state);
    if (!changed.ok) return changed;
    const diary = { ...day.value.diary, entries: changed.value.entries, updatedAt: now };
    const view = viewFor(diary, day.value.state.targets);
    if (!view.ok) return view;
    const saved = await repository.save({ ...day.value.state, diaries: day.value.state.diaries.map(item => item.localDate === localDate ? diary : item) });
    if (!saved.ok) return saved;
    publish();
    const { entry, added } = changed.value;
    return { ok: true, value: { entry, view: view.value, fact: added && entry ? { type: 'entryAdded', entryId: entry.id, localDate, meal: entry.meal, occurredAt: now } : null } };
  });
  const editEntry = (localDate: LocalDateKey, id: NutritionEntryId, update: (entry: NutritionDiaryEntry, now: string) => NutritionDiaryEntry | null) => mutate(localDate, (diary, now) => {
    if (!isText(id)) return { ok: false, error: 'invalidEntryId' };
    const original = diary.entries.find(entry => entry.id === id);
    if (!original) return { ok: false, error: 'entryNotFound' };
    const entry = update(original, now);
    return { ok: true, value: { entry, added: false, entries: diary.entries.flatMap(item => item.id === id ? entry ? [entry] : [] : [item]) } };
  });
  return {
    subscribe(listener: Listener) { scope.listeners.add(listener); return () => { scope.listeners.delete(listener); }; },
    getDay(localDate: LocalDateKey): Promise<NutritionResult<DailyNutritionView>> {
      return serial(async () => {
        const loaded = await read();
        if (!loaded.ok) return loaded;
        const day = ensureDay(loaded.value, localDate);
        if (!day.ok) return day;
        const view = viewFor(day.value.diary, day.value.state.targets);
        if (!view.ok) return view;
        if (day.value.created) { const saved = await repository.save(day.value.state); if (!saved.ok) return saved; }
        // Reads and seed creation never produce user-add facts or change notifications.
        return view;
      });
    },
    addEntry(input: { localDate: LocalDateKey; meal: MealType; food: FoodSnapshot; quantityGrams: number }): Promise<NutritionResult<NutritionChange>> {
      // Capture the snapshot now, before a pending queue operation can mutate its source.
      const food = parseFoodSnapshot(input.food), quantity = quantityFromGrams(input.quantityGrams);
      if (!food.ok) return Promise.resolve(food);
      if (!quantity.ok) return Promise.resolve(quantity);
      if (!isMealType(input.meal)) return Promise.resolve({ ok: false, error: 'invalidMeal' });
      const { localDate, meal } = input;
      return mutate(localDate, (diary, now, state) => {
        const id = options.nextId();
        if (!isText(id)) return { ok: false, error: 'invalidEntryId' };
        if (state.diaries.some(item => item.entries.some(entry => entry.id === id))) return { ok: false, error: 'duplicateEntryId' };
        const entry: NutritionDiaryEntry = { id: id as NutritionEntryId, localDate, meal, food: food.value, quantity: quantity.value, createdAt: now, updatedAt: now };
        return { ok: true, value: { entry, entries: [...diary.entries, entry], added: true } };
      });
    },
    updateEntryQuantity(localDate: LocalDateKey, id: NutritionEntryId, grams: number): Promise<NutritionResult<NutritionChange>> {
      const quantity = quantityFromGrams(grams);
      return quantity.ok ? editEntry(localDate, id, (entry, now) => ({ ...entry, quantity: quantity.value, updatedAt: now })) : Promise.resolve(quantity);
    },
    moveEntry(localDate: LocalDateKey, id: NutritionEntryId, meal: MealType): Promise<NutritionResult<NutritionChange>> {
      return isMealType(meal) ? editEntry(localDate, id, (entry, now) => ({ ...entry, meal, updatedAt: now })) : Promise.resolve({ ok: false, error: 'invalidMeal' });
    },
    deleteEntry: (localDate: LocalDateKey, id: NutritionEntryId) => editEntry(localDate, id, () => null),
    getTargets(): Promise<NutritionResult<NutritionTargets>> { return serial(async () => { const loaded = await read(); return loaded.ok ? { ok: true, value: loaded.value.targets } : loaded; }); },
    setTargets(targets: NutritionTargets): Promise<NutritionResult<NutritionTargets>> {
      if (!isTargets(targets)) return Promise.resolve({ ok: false, error: 'invalidTargets' });
      const snapshot = { energyCentiKcal: targets.energyCentiKcal, proteinMg: targets.proteinMg, fatMg: targets.fatMg, carbsMg: targets.carbsMg };
      return serial(async () => {
        const loaded = await read(); if (!loaded.ok) return loaded;
        const saved = await repository.save({ ...loaded.value, targets: snapshot });
        if (!saved.ok) return saved;
        publish(); return { ok: true, value: snapshot };
      });
    },
    getHistory(from: LocalDateKey, through: LocalDateKey): Promise<NutritionResult<readonly DailyNutritionDiary[]>> {
      return serial(async () => {
        if (!isLocalDateKey(from) || !isLocalDateKey(through) || from > through) return { ok: false, error: 'invalidLocalDate' };
        const loaded = await read();
        return loaded.ok ? { ok: true, value: loaded.value.diaries.filter(diary => diary.localDate >= from && diary.localDate <= through).sort((a, b) => a.localDate.localeCompare(b.localDate)) } : loaded;
      });
    },
    resetForDevelopment(localDate: LocalDateKey): Promise<NutritionResult<DailyNutritionView>> {
      if (!options.allowDevelopmentReset || repository.mode !== 'developmentDemo') return Promise.resolve({ ok: false, error: 'resetDisabled' });
      return serial(async () => {
        const day = ensureDay(createInitialNutritionState('developmentDemo'), localDate);
        if (!day.ok) return day;
        const view = viewFor(day.value.diary, day.value.state.targets);
        if (!view.ok) return view;
        const saved = await repository.save(day.value.state);
        if (!saved.ok) return saved;
        publish(); return view;
      });
    },
  };
}
export type NutritionService = ReturnType<typeof createNutritionService>;
