import type { AppLocale } from '../../../shared/i18n/messages';
import type { ExerciseCatalogRepository } from '../application/ExerciseCatalogRepository';
import { exerciseContent, parseExerciseId, primaryExerciseGroup, type Exercise, type ExerciseId } from '../domain/exercise';
import { getExerciseMessages } from './messages';
export function exerciseRoute(id: ExerciseId) { return { pathname: '/exercises/[id]' as const, params: { id } }; }
export function resolveExercise(repository: ExerciseCatalogRepository, rawId: unknown) {
  const id = parseExerciseId(rawId);
  return id ? repository.getById(id) : null;
}
export function presentExercise(exercise: Exercise, locale: AppLocale) {
  const copy = getExerciseMessages(locale), content = exerciseContent(exercise, locale);
  return {
    id: exercise.id, catalogNumber: exercise.catalogNumber, group: primaryExerciseGroup(exercise), groupLabel: copy.groups[primaryExerciseGroup(exercise)], name: content.name, media: exercise.media,
    primaryMuscles: exercise.primaryMuscles.map(muscle => copy.muscles[muscle]),
    secondaryMuscles: (exercise.secondaryMuscles ?? []).map(muscle => copy.muscles[muscle]),
    equipment: exercise.equipment.map(item => copy.equipmentLabels[item]),
    tracking: copy.trackingLabels[exercise.trackingType], instructions: content.instructions, tips: content.tips ?? [],
  };
}
