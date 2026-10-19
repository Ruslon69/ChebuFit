declare const exerciseId: unique symbol;
export type ExerciseId = string & { readonly [exerciseId]: true };
export const muscles = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'lowerBack'] as const;
export type Muscle = typeof muscles[number];
export const equipmentTypes = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'bench', 'pullupBar', 'ezBar', 'kettlebell', 'other'] as const;
export type Equipment = typeof equipmentTypes[number];
export const trackingTypes = ['weightReps', 'reps', 'duration'] as const;
export type ExerciseTrackingType = typeof trackingTypes[number];
export type ExerciseContent = Readonly<{ name: string; instructions: readonly string[]; tips?: readonly string[] }>;
/** Logical first-party asset keys. Native asset resolution belongs to presentation. */
export type ExerciseMedia = Readonly<{
  illustrationAssetKey: string;
  /** Optional optimized thumbnail; otherwise the canonical illustration is reused. */
  thumbnailAssetKey?: string;
}>;
export type Exercise = Readonly<{
  id: ExerciseId;
  content: Readonly<{ ru: ExerciseContent; en?: ExerciseContent }>;
  aliases: readonly string[];
  primaryMuscles: readonly Muscle[];
  secondaryMuscles?: readonly Muscle[];
  equipment: readonly Equipment[];
  trackingType: ExerciseTrackingType;
  /** Optional local artwork; absent or unbound keys render a neutral fallback. */
  media?: ExerciseMedia;
}>;
export function parseExerciseId(value: unknown): ExerciseId | null {
  return typeof value === 'string' && value.length <= 120 && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value) ? value as ExerciseId : null;
}
export function exerciseContent(exercise: Exercise, locale: 'ru' | 'en' = 'ru'): ExerciseContent {
  return exercise.content[locale] ?? exercise.content.ru;
}
