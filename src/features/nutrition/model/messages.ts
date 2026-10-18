import type { AppLocale } from '../../../shared/i18n/messages';
import type { LocalDateKey } from '../domain/types';
import { shiftDiaryDate } from './diaryPresentation';

const translations = {
  ru: {
    title: 'Питание', today: 'Сегодня', yesterday: 'Вчера', previous: 'Предыдущий день', next: 'Следующий день',
    overview: 'Открыть Сегодня', returnToday: 'Вернуться к сегодняшнему дню',
    kcal: 'ккал', grams: 'г', of: 'из', remaining: 'Осталось',
    macros: { protein: 'Белки', fat: 'Жиры', carbs: 'Углеводы' },
    meals: { breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', snacks: 'Перекусы' },
    add: 'Добавить продукт', addTo: 'Добавить продукт: ', emptyMeal: 'Пока ничего не добавлено',
    loading: 'Загружаем дневник…', unavailable: 'Не удалось загрузить дневник', retry: 'Попробовать ещё раз',
    editor: 'Запись в дневнике', close: 'Закрыть редактирование', quantity: 'Количество', meal: 'Приём пищи',
    save: 'Сохранить', delete: 'Удалить из дневника', confirmDelete: 'Удалить продукт из дневника?',
    deleteAction: 'Удалить продукт', cancel: 'Отмена', done: 'Готово',
    invalidQuantity: 'Введите количество больше нуля, до трёх знаков после запятой.',
    saveError: 'Не удалось сохранить изменения. Попробуйте ещё раз.', editHint: 'Изменить количество или приём пищи',
    searchLater: 'Поиск продуктов появится на следующем этапе.', invalidContext: 'Не удалось открыть выбранный приём пищи.', back: 'Вернуться к дневнику',
  },
  en: {
    title: 'Nutrition', today: 'Today', yesterday: 'Yesterday', previous: 'Previous day', next: 'Next day',
    overview: 'Open Today', returnToday: 'Return to today', kcal: 'kcal', grams: 'g', of: 'of', remaining: 'Remaining',
    macros: { protein: 'Protein', fat: 'Fat', carbs: 'Carbs' },
    meals: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' },
    add: 'Add food', addTo: 'Add food to: ', emptyMeal: 'Nothing added yet', loading: 'Loading diary…',
    unavailable: 'Could not load your diary', retry: 'Try again', editor: 'Diary entry', close: 'Close editor',
    quantity: 'Quantity', meal: 'Meal', save: 'Save', delete: 'Delete from diary', confirmDelete: 'Delete food from diary?',
    deleteAction: 'Delete food', cancel: 'Cancel', done: 'Done',
    invalidQuantity: 'Enter a positive amount with up to three decimal places.', saveError: 'Could not save changes. Please try again.',
    editHint: 'Edit quantity or meal', searchLater: 'Food search will be added in the next stage.',
    invalidContext: 'Could not open the selected meal.', back: 'Return to diary',
  },
};
export const getNutritionMessages = (locale: AppLocale) => translations[locale];
export type NutritionCopy = ReturnType<typeof getNutritionMessages>;
export function nutritionFormatters(locale: AppLocale) {
  const language = locale === 'ru' ? 'ru-RU' : 'en-US';
  const copy = getNutritionMessages(locale);
  return {
    number: (value: number, decimals = 0) => new Intl.NumberFormat(language, { maximumFractionDigits: decimals }).format(value),
    date: (date: LocalDateKey, today: LocalDateKey) => {
      const [year, month, day] = date.split('-').map(Number);
      const value = new Date(0); value.setFullYear(year, month - 1, day); value.setHours(12, 0, 0, 0);
      const label = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long', ...(date.slice(0, 4) !== today.slice(0, 4) ? { year: 'numeric' as const } : {}) }).format(value);
      const relative = date === today ? copy.today : date === shiftDiaryDate(today, -1) ? copy.yesterday : null;
      return relative ? `${relative}, ${label}` : label;
    },
  };
}
