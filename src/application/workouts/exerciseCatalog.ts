import { createLocalExerciseCatalog } from '../../features/workouts/application/LocalExerciseCatalog';
import { builtinExercises } from '../../features/workouts/data/builtinExercises';
export const exerciseCatalog = createLocalExerciseCatalog(builtinExercises);
