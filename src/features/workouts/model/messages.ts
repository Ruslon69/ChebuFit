import type { AppLocale } from '../../../shared/i18n/messages';
import type { Equipment, ExerciseTrackingType, ExerciseGroup, Muscle } from '../domain/exercise';
type ExerciseCopy = {
  catalog: string; exercise: string; allGroups: string; groupNavigation: string; groups: Record<ExerciseGroup, string>; yourWorkouts: string; foundation: string; catalogHint: string;
  search: string; clearSearch: string; muscle: string; equipment: string; allMuscles: string; allEquipment: string;
  resetFilters: string; resetAll: string; found: string; close: string; muscleHint: string;
  empty: string; emptyHint: string; missing: string; backCatalog: string; openExercise: string;
  visual: string; primary: string; secondary: string; tracking: string; instructions: string; tips: string;
  muscles: Record<Muscle, string>; equipmentLabels: Record<Equipment, string>; trackingLabels: Record<ExerciseTrackingType, string>;
};
const translations: Record<AppLocale, ExerciseCopy> = {
  ru: {
    allGroups: 'Все', groupNavigation: 'Группы упражнений', groups: { chest: 'Грудь', back: 'Спина', shoulders: 'Плечи', arms: 'Руки', legs: 'Ноги', glutes: 'Ягодицы', core: 'Пресс и корпус', fullBody: 'Всё тело' },
    catalog: 'Упражнения', exercise: 'Упражнение', yourWorkouts: 'Ваши тренировки', foundation: 'Планирование и запись тренировок появятся позже.', catalogHint: 'Техника, мышцы и оборудование',
    search: 'Поиск упражнений', clearSearch: 'Очистить поиск', muscle: 'Мышцы', equipment: 'Оборудование', allMuscles: 'Все мышцы', allEquipment: 'Любое оборудование',
    resetFilters: 'Сбросить фильтры', resetAll: 'Сбросить поиск и фильтры', found: 'Найдено', close: 'Закрыть фильтр', muscleHint: 'Основные и дополнительные мышцы.',
    empty: 'Ничего не найдено', emptyHint: 'Попробуйте изменить поиск или фильтры.', missing: 'Упражнение не найдено', backCatalog: 'К каталогу', openExercise: 'Открыть технику упражнения',
    visual: 'Движение и техника', primary: 'Основные мышцы', secondary: 'Также работают', tracking: 'Способ учёта', instructions: 'Как выполнять', tips: 'Обратите внимание',
    muscles: { chest: 'Грудь', back: 'Спина', shoulders: 'Плечи', rearShoulders: 'Задняя часть плеч', traps: 'Трапеции', core: 'Корпус', obliques: 'Косые мышцы живота', posteriorChain: 'Задняя цепь', hipFlexors: 'Сгибатели бедра', legs: 'Ноги', fullBody: 'Всё тело', biceps: 'Бицепс', triceps: 'Трицепс', forearms: 'Предплечья', quadriceps: 'Квадрицепс', hamstrings: 'Задняя поверхность бедра', glutes: 'Ягодицы', calves: 'Икры', abs: 'Пресс', lowerBack: 'Поясница' },
    equipmentLabels: { barbell: 'Штанга', dumbbells: 'Гантели', machine: 'Тренажёр', cable: 'Блок', bodyweight: 'Собственный вес', bench: 'Скамья', pullUpBar: 'Турник', ezBar: 'EZ-гриф', kettlebell: 'Гиря', other: 'Другое', rack: 'Стойки', dipBars: 'Брусья', preacherBench: 'Скамья Скотта', machineOrBarbell: 'Тренажёр или штанга', barbellOrEzBar: 'Штанга или EZ-гриф', dumbbellOrKettlebell: 'Гантель или гиря' },
    trackingLabels: { weightReps: 'Вес и повторения', reps: 'Повторения', duration: 'Время' },
  },
  en: {
    allGroups: 'All', groupNavigation: 'Exercise groups', groups: { chest: 'Chest', back: 'Back', shoulders: 'Shoulders', arms: 'Arms', legs: 'Legs', glutes: 'Glutes', core: 'Abs and core', fullBody: 'Full body' },
    catalog: 'Exercises', exercise: 'Exercise', yourWorkouts: 'Your workouts', foundation: 'Workout planning and logging are coming later.', catalogHint: 'Technique, muscles and equipment',
    search: 'Search exercises', clearSearch: 'Clear search', muscle: 'Muscles', equipment: 'Equipment', allMuscles: 'All muscles', allEquipment: 'Any equipment',
    resetFilters: 'Reset filters', resetAll: 'Reset search and filters', found: 'Found', close: 'Close filter', muscleHint: 'Primary and secondary muscles.',
    empty: 'Nothing found', emptyHint: 'Try changing your search or filters.', missing: 'Exercise not found', backCatalog: 'Back to catalog', openExercise: 'Open exercise technique',
    visual: 'Movement and technique', primary: 'Primary muscles', secondary: 'Also working', tracking: 'Tracking', instructions: 'How to perform', tips: 'Technique cues',
    muscles: { chest: 'Chest', back: 'Back', shoulders: 'Shoulders', rearShoulders: 'Rear shoulders', traps: 'Traps', core: 'Core', obliques: 'Obliques', posteriorChain: 'Posterior chain', hipFlexors: 'Hip flexors', legs: 'Legs', fullBody: 'Full body', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms', quadriceps: 'Quadriceps', hamstrings: 'Hamstrings', glutes: 'Glutes', calves: 'Calves', abs: 'Abs', lowerBack: 'Lower back' },
    equipmentLabels: { barbell: 'Barbell', dumbbells: 'Dumbbells', machine: 'Machine', cable: 'Cable', bodyweight: 'Bodyweight', bench: 'Bench', pullUpBar: 'Pull-up bar', ezBar: 'EZ bar', kettlebell: 'Kettlebell', other: 'Other', rack: 'Rack', dipBars: 'Dip bars', preacherBench: 'Preacher bench', machineOrBarbell: 'Machine or barbell', barbellOrEzBar: 'Barbell or EZ bar', dumbbellOrKettlebell: 'Dumbbell or kettlebell' },
    trackingLabels: { weightReps: 'Weight and reps', reps: 'Reps', duration: 'Duration' },
  },
};
export const getExerciseMessages = (locale: AppLocale) => translations[locale];

export function formatExerciseCount(count: number, locale: AppLocale, active: boolean) {
  if (active) return `${getExerciseMessages(locale).found}: ${count}`;
  if (locale === 'en') return `${count} ${count === 1 ? 'exercise' : 'exercises'}`;
  // Hermes does not guarantee Intl.PluralRules; counts are nonnegative integers.
  const last = count % 10, lastTwo = count % 100;
  const noun = last === 1 && lastTwo !== 11 ? 'упражнение' : last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? 'упражнения' : 'упражнений';
  return `${count} ${noun}`;
}
