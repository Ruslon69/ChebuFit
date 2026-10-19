declare const exerciseId: unique symbol;
export type ExerciseId = string & { readonly [exerciseId]: true };
export type ExerciseCatalogNumber = `EX-${number}`;
export const exerciseGroups = ['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core', 'fullBody'] as const;
export type ExerciseGroup = typeof exerciseGroups[number];
export const muscles = ['chest', 'back', 'shoulders', 'rearShoulders', 'traps', 'biceps', 'triceps', 'forearms', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'lowerBack', 'core', 'obliques', 'posteriorChain', 'hipFlexors', 'legs', 'fullBody'] as const;
export type Muscle = typeof muscles[number];
export const equipmentTypes = ['barbell', 'dumbbells', 'machine', 'cable', 'bodyweight', 'bench', 'pullUpBar', 'ezBar', 'kettlebell', 'rack', 'dipBars', 'preacherBench', 'other', 'machineOrBarbell', 'barbellOrEzBar', 'dumbbellOrKettlebell'] as const;
export type Equipment = typeof equipmentTypes[number];
export const trackingTypes = ['weightReps', 'reps', 'duration'] as const;
export type ExerciseTrackingType = typeof trackingTypes[number];
export type ExerciseContent = Readonly<{ name: string; instructions: readonly string[]; tips?: readonly string[] }>;
/** Logical first-party asset keys. Native asset resolution belongs to presentation. */
export type ExerciseMedia = Readonly<{
  illustrationAssetKey: string;
  /** Optional optimized thumbnail; otherwise the canonical illustration is reused. */
  thumbnailAssetKey?: string;
  /** Reserved static movement-phase references; no phase viewer/player yet. */
  phaseAssetKeys?: Readonly<{ start?: string; end?: string }>;
}>;
export type Exercise = Readonly<{
  id: ExerciseId;
  catalogNumber: ExerciseCatalogNumber;
  /** Extra discovery memberships; the primary group is derived from first primary muscle. */
  additionalGroups?: readonly ExerciseGroup[];
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

export const muscleGroups: Readonly<Record<Muscle, ExerciseGroup>> = {
  chest: 'chest', back: 'back', lowerBack: 'back', shoulders: 'shoulders', rearShoulders: 'shoulders', traps: 'shoulders',
  biceps: 'arms', triceps: 'arms', forearms: 'arms', quadriceps: 'legs', hamstrings: 'legs', calves: 'legs', posteriorChain: 'legs', hipFlexors: 'legs', legs: 'legs',
  glutes: 'glutes', abs: 'core', core: 'core', obliques: 'core', fullBody: 'fullBody',
};
export function primaryExerciseGroup(exercise: Exercise): ExerciseGroup { return muscleGroups[exercise.primaryMuscles[0]]; }
export function matchesExerciseGroup(exercise: Exercise, group: ExerciseGroup): boolean { return primaryExerciseGroup(exercise) === group || !!exercise.additionalGroups?.includes(group); }
const equipmentAlternatives: Partial<Record<Equipment, readonly Equipment[]>> = {
  machineOrBarbell: ['machine', 'barbell'], barbellOrEzBar: ['barbell', 'ezBar'], dumbbellOrKettlebell: ['dumbbells', 'kettlebell'],
};
/** Multiple required items remain distinct from one-of equipment alternatives. */
export function matchesEquipment(exercise: Exercise, equipment: Equipment): boolean {
  return exercise.equipment.some(item => item === equipment || equipmentAlternatives[item]?.includes(equipment));
}
export const filterEquipmentTypes = equipmentTypes.filter(item => !equipmentAlternatives[item]);
export function parseExerciseCatalogNumber(value: unknown): ExerciseCatalogNumber | null {
  if (typeof value !== 'string' || !/^EX-[0-9]{3,}$/.test(value)) return null;
  const number = Number(value.slice(3));
  return Number.isSafeInteger(number) && number > 0 && value === `EX-${String(number).padStart(3, '0')}` ? value as ExerciseCatalogNumber : null;
}
