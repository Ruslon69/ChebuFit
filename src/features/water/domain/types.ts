import type { LocalDateKey } from '../../../shared/utils/localCalendar';
export type { LocalDateKey } from '../../../shared/utils/localCalendar';
declare const waterAmount: unique symbol;
declare const waterGoal: unique symbol;
export type WaterAmountMl = number & { readonly [waterAmount]: true };
export type WaterGoalMl = number & { readonly [waterGoal]: true };
export type DailyWaterRecord = Readonly<{
  localDate: LocalDateKey;
  consumedMl: WaterAmountMl;
  goalMl: WaterGoalMl;
  createdAt: string;
  updatedAt: string;
}>;
export type WaterError = 'invalidAmount' | 'invalidGoal' | 'invalidLocalDate' | 'amountOverflow'
  | 'corruptData' | 'unsupportedSchema' | 'storageUnavailable' | 'resetDisabled' | 'invalidTimestamp';
export type WaterResult<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; error: WaterError }>;
export type WaterChange = Readonly<{ record: DailyWaterRecord; crossedGoal: boolean }>;
