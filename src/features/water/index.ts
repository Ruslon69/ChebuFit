export type { WaterAmountMl, WaterGoalMl, LocalDateKey, DailyWaterRecord, WaterResult, WaterError, WaterChange } from './domain/types';
export { changeWater, waterDefaults } from './domain/water';
export { createWaterService } from './application/WaterService';
export type { WaterService } from './application/WaterService';
export type { WaterRepository } from './application/WaterRepository';
export { createInitialWaterState, decodeWaterState } from './application/WaterState';
export type { WaterStateV1, WaterMode } from './application/WaterState';
