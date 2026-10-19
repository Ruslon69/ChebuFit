import { matchesEquipment, matchesExerciseGroup, parseExerciseCatalogNumber, parseExerciseId, type Exercise, type ExerciseId } from '../domain/exercise';
import type { ExerciseCatalogQuery, ExerciseCatalogRepository } from './ExerciseCatalogRepository';
const normalize = (text: string) => text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru-RU').replace(/ё/g, 'е');
const alphabetical = (a: Exercise, b: Exercise) => a.content.ru.name.localeCompare(b.content.ru.name, 'ru') || a.id.localeCompare(b.id);
function rank(exercise: Exercise, text: string) {
  const names = Object.values(exercise.content).map(content => normalize(content.name));
  if (names.some(name => name === text)) return 0;
  if (names.some(name => name.startsWith(text))) return 1;
  if (names.some(name => name.includes(text))) return 2;
  return exercise.aliases.some(alias => normalize(alias).includes(text)) ? 3 : -1;
}
export function createLocalExerciseCatalog(source: readonly Exercise[], idAliases: Readonly<Record<string, ExerciseId>> = {}): ExerciseCatalogRepository {
  // Freeze detached data so consumers cannot mutate the shared catalog through a read.
  const frozen = source.map(exercise => {
    const content = Object.fromEntries(Object.entries(exercise.content).filter(([, value]) => value !== undefined).map(([locale, value]) => [locale, Object.freeze({ ...value, instructions: Object.freeze([...value.instructions]), ...(value.tips ? { tips: Object.freeze([...value.tips]) } : {}) })]));
    return Object.freeze({ ...exercise, content: Object.freeze(content) as Exercise['content'], aliases: Object.freeze([...exercise.aliases]), primaryMuscles: Object.freeze([...exercise.primaryMuscles]), ...(exercise.secondaryMuscles ? { secondaryMuscles: Object.freeze([...exercise.secondaryMuscles]) } : {}), equipment: Object.freeze([...exercise.equipment]), ...(exercise.additionalGroups ? { additionalGroups: Object.freeze([...exercise.additionalGroups]) } : {}), ...(exercise.media ? { media: Object.freeze({ ...exercise.media, ...(exercise.media.phaseAssetKeys ? { phaseAssetKeys: Object.freeze({ ...exercise.media.phaseAssetKeys }) } : {}) }) } : {}) });
  });
  const all: readonly Exercise[] = Object.freeze(frozen.sort(alphabetical));
  if (new Set(all.map(exercise => exercise.id)).size !== all.length) throw new Error('Duplicate exercise identity');
  if (all.some(exercise => !parseExerciseCatalogNumber(exercise.catalogNumber))) throw new Error('Invalid exercise catalog number');
  if (new Set(all.map(exercise => exercise.catalogNumber)).size !== all.length) throw new Error('Duplicate exercise catalog number');
  const byId = new Map(all.map(exercise => [exercise.id, exercise]));
  const alternateIds = new Map(Object.entries(idAliases));
  for (const [alias, target] of alternateIds) {
    if (!parseExerciseId(alias) || byId.has(alias as ExerciseId) || !byId.has(target)) throw new Error('Invalid exercise identity alias');
  }
  return {
    getAll: () => all,
    getById: id => byId.get(id) ?? byId.get(alternateIds.get(id) as ExerciseId) ?? null,
    search: ({ text = '', group, muscle, equipment }: ExerciseCatalogQuery = {}) => {
      const query = normalize(text);
      return all.filter(exercise => (!group || matchesExerciseGroup(exercise, group)) && (!muscle || exercise.primaryMuscles.includes(muscle) || exercise.secondaryMuscles?.includes(muscle)) && (!equipment || matchesEquipment(exercise, equipment)))
        .map(exercise => ({ exercise, score: query ? rank(exercise, query) : 0 })).filter(row => row.score >= 0)
        .sort((a, b) => a.score - b.score || alphabetical(a.exercise, b.exercise)).map(row => row.exercise);
    },
  };
}
