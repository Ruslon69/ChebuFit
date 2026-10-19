import type { Equipment, Exercise, ExerciseId, ExerciseGroup, Muscle } from '../domain/exercise';
export type ExerciseCatalogQuery = Readonly<{ text?: string; group?: ExerciseGroup; muscle?: Muscle; equipment?: Equipment }>;
/** Local, immutable read model. Personal catalogs can later be composed by stable ID. */
export interface ExerciseCatalogRepository {
  getAll(): readonly Exercise[];
  getById(id: ExerciseId): Exercise | null;
  search(query?: ExerciseCatalogQuery): readonly Exercise[];
}
