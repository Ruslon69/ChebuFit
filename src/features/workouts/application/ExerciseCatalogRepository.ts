import type { Equipment, Exercise, ExerciseId, Muscle } from '../domain/exercise';
export type ExerciseCatalogQuery = Readonly<{ text?: string; muscle?: Muscle; equipment?: Equipment }>;
/** Local, immutable read model. Personal catalogs can later be composed by stable ID. */
export interface ExerciseCatalogRepository {
  getAll(): readonly Exercise[];
  getById(id: ExerciseId): Exercise | null;
  search(query?: ExerciseCatalogQuery): readonly Exercise[];
}
