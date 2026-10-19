// Platform-independent public contract for future template/session/Watch consumers.
export { muscles, equipmentTypes, trackingTypes, parseExerciseId, exerciseContent } from './domain/exercise';
export type { Exercise, ExerciseId, ExerciseContent, ExerciseTrackingType, Muscle, Equipment } from './domain/exercise';
export type { ExerciseCatalogRepository, ExerciseCatalogQuery } from './application/ExerciseCatalogRepository';
export { createLocalExerciseCatalog } from './application/LocalExerciseCatalog';
