import type { NutritionResult } from '../domain/types';
import type { NutritionMode, NutritionStateV1 } from './NutritionState';
export interface NutritionRepository {
  readonly identity: string;
  readonly mode: NutritionMode;
  load(): Promise<NutritionResult<NutritionStateV1 | null>>;
  save(state: NutritionStateV1): Promise<NutritionResult<void>>;
}
