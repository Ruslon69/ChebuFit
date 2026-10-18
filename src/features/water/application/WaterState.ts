import { isLocalDateKey } from '../../../shared/utils/localCalendar';
import type { DailyWaterRecord, LocalDateKey, WaterAmountMl, WaterGoalMl, WaterResult } from '../domain/types';
import { isWaterAmountMl, isWaterGoalMl, isWaterTimestamp, waterDefaults } from '../domain/water';

export type WaterMode = 'real' | 'developmentDemo';
export type WaterStateV1 = Readonly<{
  schemaVersion: 1;
  mode: WaterMode;
  defaultGoalMl: WaterGoalMl;
  demoSeed: Readonly<{ amountMl: WaterAmountMl; localDate: LocalDateKey | null }> | null;
  dailyRecords: readonly DailyWaterRecord[];
}>;
export function createInitialWaterState(mode: WaterMode): WaterStateV1 {
  return { schemaVersion: 1, mode, defaultGoalMl: waterDefaults.goalMl,
    demoSeed: mode === 'developmentDemo' ? { amountMl: waterDefaults.developmentOpeningMl, localDate: null } : null,
    dailyRecords: [] };
}
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Schema/migration boundary: invalid or newer data is never replaced silently. */
export function decodeWaterState(data: unknown, mode: WaterMode): WaterResult<WaterStateV1> {
  const corrupt = { ok: false, error: 'corruptData' } as const;
  if (!object(data)) return corrupt;
  if (typeof data.schemaVersion === 'number' && data.schemaVersion > 1) return { ok: false, error: 'unsupportedSchema' };
  if (data.schemaVersion !== 1 || data.mode !== mode || !isWaterGoalMl(data.defaultGoalMl) || !Array.isArray(data.dailyRecords)) return corrupt;
  let demoSeed: WaterStateV1['demoSeed'] = null;
  if (mode === 'developmentDemo') {
    if (!object(data.demoSeed) || data.demoSeed.amountMl !== waterDefaults.developmentOpeningMl
      || !(data.demoSeed.localDate === null || isLocalDateKey(data.demoSeed.localDate))) return corrupt;
    demoSeed = { amountMl: waterDefaults.developmentOpeningMl, localDate: data.demoSeed.localDate };
  } else if (data.demoSeed !== null) return corrupt;
  const records: DailyWaterRecord[] = [], dates = new Set<string>();
  for (const item of data.dailyRecords) {
    if (!object(item) || !isLocalDateKey(item.localDate) || dates.has(item.localDate)
      || !isWaterAmountMl(item.consumedMl) || !isWaterGoalMl(item.goalMl)
      || !isWaterTimestamp(item.createdAt) || !isWaterTimestamp(item.updatedAt)
      || Date.parse(item.updatedAt) < Date.parse(item.createdAt)) return corrupt;
    dates.add(item.localDate);
    records.push({ localDate: item.localDate, consumedMl: item.consumedMl, goalMl: item.goalMl, createdAt: item.createdAt, updatedAt: item.updatedAt });
  }
  if (demoSeed && (demoSeed.localDate === null ? records.length !== 0 : !dates.has(demoSeed.localDate))) return corrupt;
  return { ok: true, value: { schemaVersion: 1, mode, defaultGoalMl: data.defaultGoalMl, demoSeed, dailyRecords: records } };
}
