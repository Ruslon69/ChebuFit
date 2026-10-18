import type { WaterResult } from '../domain/types';
import type { WaterMode, WaterStateV1 } from './WaterState';

export interface WaterRepository {
  readonly identity: string;
  readonly mode: WaterMode;
  load(): Promise<WaterResult<WaterStateV1 | null>>;
  save(state: WaterStateV1): Promise<WaterResult<void>>;
}
