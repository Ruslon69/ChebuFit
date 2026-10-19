// Platform-independent public contract for future template/session/Watch consumers.
export { muscles, equipmentTypes, filterEquipmentTypes, trackingTypes, exerciseGroups, muscleGroups, primaryExerciseGroup, matchesExerciseGroup, matchesEquipment, parseExerciseCatalogNumber, parseExerciseId, exerciseContent } from './domain/exercise';
export type { Exercise, ExerciseId, ExerciseCatalogNumber, ExerciseGroup, ExerciseMedia, ExerciseContent, ExerciseTrackingType, Muscle, Equipment } from './domain/exercise';
export type { ExerciseCatalogRepository, ExerciseCatalogQuery } from './application/ExerciseCatalogRepository';
export { createLocalExerciseCatalog } from './application/LocalExerciseCatalog';
