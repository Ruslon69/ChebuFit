import { createLocalExerciseCatalog } from '../../features/workouts/application/LocalExerciseCatalog';
import { builtinExercises } from '../../features/workouts/data/builtinExercises';
import { exerciseIdAliases } from '../../features/workouts/data/exerciseCompatibility';
export const exerciseCatalog = createLocalExerciseCatalog(builtinExercises, exerciseIdAliases);
