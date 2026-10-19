import type { AppLocale } from '../../../shared/i18n/messages';
import type { Equipment, ExerciseTrackingType, Muscle } from '../domain/exercise';
type ExerciseCopy = {
  catalog: string; exercise: string; yourWorkouts: string; foundation: string; catalogHint: string;
  search: string; clearSearch: string; muscle: string; equipment: string; allMuscles: string; allEquipment: string;
  resetFilters: string; resetAll: string; found: string; close: string; muscleHint: string;
  empty: string; emptyHint: string; missing: string; backCatalog: string; openExercise: string;
  visual: string; primary: string; secondary: string; tracking: string; instructions: string; tips: string;
  muscles: Record<Muscle, string>; equipmentLabels: Record<Equipment, string>; trackingLabels: Record<ExerciseTrackingType, string>;
};
const translations: Record<AppLocale, ExerciseCopy> = {
  ru: {
    catalog: 'Упражнения', exercise: 'Упражнение', yourWorkouts: 'Ваши тренировки', foundation: 'Планирование и запись тренировок появятся позже.', catalogHint: 'Техника, мышцы и оборудование',
    search: 'Поиск упражнений', clearSearch: 'Очистить поиск', muscle: 'Мышцы', equipment: 'Оборудование', allMuscles: 'Все мышцы', allEquipment: 'Любое оборудование',
    resetFilters: 'Сбросить фильтры', resetAll: 'Сбросить поиск и фильтры', found: 'Найдено', close: 'Закрыть фильтр', muscleHint: 'Основные и дополнительные мышцы.',
    empty: 'Ничего не найдено', emptyHint: 'Попробуйте изменить поиск или фильтры.', missing: 'Упражнение не найдено', backCatalog: 'К каталогу', openExercise: 'Открыть технику упражнения',
    visual: 'Движение и техника', primary: 'Основные мышцы', secondary: 'Также работают', tracking: 'Способ учёта', instructions: 'Как выполнять', tips: 'Обратите внимание',
    muscles: { chest: 'Грудь', back: 'Спина', shoulders: 'Плечи', biceps: 'Бицепс', triceps: 'Трицепс', forearms: 'Предплечья', quadriceps: 'Квадрицепс', hamstrings: 'Задняя поверхность бедра', glutes: 'Ягодицы', calves: 'Икры', abs: 'Пресс', lowerBack: 'Поясница' },
    equipmentLabels: { barbell: 'Штанга', dumbbell: 'Гантели', machine: 'Тренажёр', cable: 'Блок', bodyweight: 'Собственный вес', bench: 'Скамья', pullupBar: 'Турник', ezBar: 'EZ-гриф', kettlebell: 'Гиря', other: 'Другое' },
    trackingLabels: { weightReps: 'Вес и повторения', reps: 'Повторения', duration: 'Время' },
  },
  en: {
    catalog: 'Exercises', exercise: 'Exercise', yourWorkouts: 'Your workouts', foundation: 'Workout planning and logging are coming later.', catalogHint: 'Technique, muscles and equipment',
    search: 'Search exercises', clearSearch: 'Clear search', muscle: 'Muscles', equipment: 'Equipment', allMuscles: 'All muscles', allEquipment: 'Any equipment',
    resetFilters: 'Reset filters', resetAll: 'Reset search and filters', found: 'Found', close: 'Close filter', muscleHint: 'Primary and secondary muscles.',
    empty: 'Nothing found', emptyHint: 'Try changing your search or filters.', missing: 'Exercise not found', backCatalog: 'Back to catalog', openExercise: 'Open exercise technique',
    visual: 'Movement and technique', primary: 'Primary muscles', secondary: 'Also working', tracking: 'Tracking', instructions: 'How to perform', tips: 'Technique cues',
    muscles: { chest: 'Chest', back: 'Back', shoulders: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms', quadriceps: 'Quadriceps', hamstrings: 'Hamstrings', glutes: 'Glutes', calves: 'Calves', abs: 'Abs', lowerBack: 'Lower back' },
    equipmentLabels: { barbell: 'Barbell', dumbbell: 'Dumbbells', machine: 'Machine', cable: 'Cable', bodyweight: 'Bodyweight', bench: 'Bench', pullupBar: 'Pull-up bar', ezBar: 'EZ bar', kettlebell: 'Kettlebell', other: 'Other' },
    trackingLabels: { weightReps: 'Weight and reps', reps: 'Reps', duration: 'Duration' },
  },
};
export const getExerciseMessages = (locale: AppLocale) => translations[locale];
