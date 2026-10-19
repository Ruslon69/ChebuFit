import type { ExerciseId } from '../domain/exercise';

// Approved alternate spellings resolve to the already established movement ID.
export const exerciseIdAliases: Readonly<Record<string, ExerciseId>> = {
  "cable-chest-fly": "cable-fly" as ExerciseId,
  "dumbbell-chest-fly": "dumbbell-fly" as ExerciseId,
  "barbell-bent-over-row": "barbell-row" as ExerciseId,
  "one-arm-dumbbell-row": "dumbbell-row" as ExerciseId,
  "seated-dumbbell-shoulder-press": "dumbbell-shoulder-press" as ExerciseId,
  "dumbbell-reverse-fly": "rear-delt-fly" as ExerciseId,
  "cable-triceps-pushdown": "triceps-pushdown" as ExerciseId,
  "overhead-dumbbell-triceps-extension": "overhead-triceps-extension" as ExerciseId,
  "lying-leg-curl": "leg-curl" as ExerciseId
};

// Removed from v1 selection; never repurpose these IDs for another movement.
export const retiredExerciseIds = ['machine-chest-press', 'chest-supported-row', 'walking-lunge'] as const;
