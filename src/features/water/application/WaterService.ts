import { isLocalDateKey } from '../../../shared/utils/localCalendar';
import type { DailyWaterRecord, LocalDateKey, WaterChange, WaterGoalMl, WaterResult } from '../domain/types';
import { changeWater, isWaterGoalMl, isWaterTimestamp } from '../domain/water';
import type { WaterRepository } from './WaterRepository';
import { createInitialWaterState, type WaterStateV1 } from './WaterState';

type Listener = (record: DailyWaterRecord) => void;
type Scope = { tail: Promise<void>; listeners: Set<Listener> };
const scopes = new Map<string, Scope>();
function scopeFor(identity: string): Scope {
  let scope = scopes.get(identity);
  if (!scope) { scope = { tail: Promise.resolve(), listeners: new Set() }; scopes.set(identity, scope); }
  return scope;
}

/** Serialized read/modify/save per storage identity in one JS process. */
export function createWaterService(repository: WaterRepository, options: { now: () => string; allowDevelopmentReset?: boolean }) {
  const scope = scopeFor(repository.identity);
  const serial = <T,>(operation: () => Promise<WaterResult<T>>): Promise<WaterResult<T>> => {
    const task = scope.tail.then(operation).catch((): WaterResult<T> => ({ ok: false, error: 'storageUnavailable' }));
    scope.tail = task.then(() => undefined);
    return task;
  };
  const read = async (): Promise<WaterResult<WaterStateV1>> => {
    const loaded = await repository.load();
    return loaded.ok ? { ok: true, value: loaded.value ?? createInitialWaterState(repository.mode) } : loaded;
  };
  const publish = (record: DailyWaterRecord) => {
    for (const listener of scope.listeners) { try { listener(record); } catch { /* A consumer cannot undo a committed write. */ } }
  };
  const ensureDay = (state: WaterStateV1, localDate: LocalDateKey): WaterResult<{ state: WaterStateV1; record: DailyWaterRecord; created: boolean }> => {
    if (!isLocalDateKey(localDate)) return { ok: false, error: 'invalidLocalDate' };
    const existing = state.dailyRecords.find(record => record.localDate === localDate);
    if (existing) return { ok: true, value: { state, record: existing, created: false } };
    const now = options.now();
    if (!isWaterTimestamp(now)) return { ok: false, error: 'invalidTimestamp' };
    const pendingSeed = state.demoSeed?.localDate === null ? state.demoSeed : null;
    const record: DailyWaterRecord = { localDate, consumedMl: pendingSeed?.amountMl ?? 0 as DailyWaterRecord['consumedMl'], goalMl: state.defaultGoalMl, createdAt: now, updatedAt: now };
    return { ok: true, value: { created: true, record, state: {
      ...state, demoSeed: pendingSeed ? { ...pendingSeed, localDate } : state.demoSeed,
      dailyRecords: [...state.dailyRecords, record],
    } } };
  };
  const change = (amountMl: number, localDate: LocalDateKey, operation: 'add' | 'remove'): Promise<WaterResult<WaterChange>> => serial(async () => {
    const loaded = await read();
    if (!loaded.ok) return loaded;
    const day = ensureDay(loaded.value, localDate);
    if (!day.ok) return day;
    const updated = changeWater(day.value.record, amountMl, operation, options.now());
    if (!updated.ok) return updated;
    const state = { ...day.value.state, dailyRecords: day.value.state.dailyRecords.map(record => record.localDate === localDate ? updated.value.record : record) };
    const saved = await repository.save(state);
    if (!saved.ok) return saved;
    publish(updated.value.record);
    return updated;
  });
  return {
    subscribe(listener: Listener) { scope.listeners.add(listener); return () => { scope.listeners.delete(listener); }; },
    getDay(localDate: LocalDateKey): Promise<WaterResult<DailyWaterRecord>> {
      return serial(async () => {
        const loaded = await read();
        if (!loaded.ok) return loaded;
        const day = ensureDay(loaded.value, localDate);
        if (!day.ok) return day;
        if (day.value.created) {
          const saved = await repository.save(day.value.state);
          if (!saved.ok) return saved;
        }
        publish(day.value.record);
        return { ok: true, value: day.value.record };
      });
    },
    addWater: (amountMl: number, localDate: LocalDateKey) => change(amountMl, localDate, 'add'),
    removeWater: (amountMl: number, localDate: LocalDateKey) => change(amountMl, localDate, 'remove'),
    getDefaultGoal(): Promise<WaterResult<WaterGoalMl>> {
      return serial(async () => { const loaded = await read(); return loaded.ok ? { ok: true, value: loaded.value.defaultGoalMl } : loaded; });
    },
    setDefaultGoal(goalMl: number): Promise<WaterResult<WaterGoalMl>> {
      return serial(async () => {
        if (!isWaterGoalMl(goalMl)) return { ok: false, error: 'invalidGoal' };
        const loaded = await read();
        if (!loaded.ok) return loaded;
        const saved = await repository.save({ ...loaded.value, defaultGoalMl: goalMl });
        return saved.ok ? { ok: true, value: goalMl } : saved;
      });
    },
    getHistory(from: LocalDateKey, through: LocalDateKey): Promise<WaterResult<readonly DailyWaterRecord[]>> {
      return serial(async () => {
        if (!isLocalDateKey(from) || !isLocalDateKey(through) || from > through) return { ok: false, error: 'invalidLocalDate' };
        const loaded = await read();
        return loaded.ok ? { ok: true, value: loaded.value.dailyRecords.filter(record => record.localDate >= from && record.localDate <= through).sort((a, b) => a.localDate.localeCompare(b.localDate)) } : loaded;
      });
    },
    resetForDevelopment(localDate: LocalDateKey): Promise<WaterResult<DailyWaterRecord>> {
      if (!options.allowDevelopmentReset || repository.mode !== 'developmentDemo') return Promise.resolve({ ok: false, error: 'resetDisabled' });
      return serial(async () => {
        const day = ensureDay(createInitialWaterState('developmentDemo'), localDate);
        if (!day.ok) return day;
        const saved = await repository.save(day.value.state);
        if (!saved.ok) return saved;
        publish(day.value.record);
        return { ok: true, value: day.value.record };
      });
    },
  };
}
export type WaterService = ReturnType<typeof createWaterService>;
