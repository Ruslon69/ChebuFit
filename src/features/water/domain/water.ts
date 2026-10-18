import { isLocalDateKey } from '../../../shared/utils/localCalendar';
import type { DailyWaterRecord, WaterAmountMl, WaterChange, WaterGoalMl, WaterResult } from './types';

export const waterDefaults = { goalMl: 2500 as WaterGoalMl, portionMl: 250, developmentOpeningMl: 1500 as WaterAmountMl } as const;
export const isWaterAmountMl = (value: unknown): value is WaterAmountMl => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
export const isWaterGoalMl = (value: unknown): value is WaterGoalMl => isWaterAmountMl(value) && value > 0;
export const isWaterTimestamp = (value: unknown): value is string => typeof value === 'string'
  && /(Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));

/** Pure integer transition. A target is never a consumption ceiling. */
export function changeWater(record: DailyWaterRecord, amountMl: number, operation: 'add' | 'remove', updatedAt: string): WaterResult<WaterChange> {
  if (!isWaterAmountMl(amountMl) || amountMl === 0) return { ok: false, error: 'invalidAmount' };
  if (!isWaterAmountMl(record.consumedMl)) return { ok: false, error: 'invalidAmount' };
  if (!isWaterGoalMl(record.goalMl)) return { ok: false, error: 'invalidGoal' };
  if (!isLocalDateKey(record.localDate)) return { ok: false, error: 'invalidLocalDate' };
  if (!isWaterTimestamp(record.createdAt) || !isWaterTimestamp(record.updatedAt) || !isWaterTimestamp(updatedAt)) return { ok: false, error: 'invalidTimestamp' };
  const consumedMl = operation === 'add' ? record.consumedMl + amountMl : Math.max(0, record.consumedMl - amountMl);
  if (!isWaterAmountMl(consumedMl)) return { ok: false, error: 'amountOverflow' };
  return { ok: true, value: {
    record: { ...record, consumedMl, updatedAt: Date.parse(updatedAt) < Date.parse(record.updatedAt) ? record.updatedAt : updatedAt },
    crossedGoal: operation === 'add' && record.consumedMl < record.goalMl && consumedMl >= record.goalMl,
  } };
}
