import type { AppLocale } from '../../../shared/i18n/messages';
import type { Nutrients } from '../../nutrition/domain/types';
import { nutritionFormatters } from '../../nutrition/model/messages';
const translations = {
  ru: {
    title: 'Добавить продукт', search: 'Поиск продуктов', clear: 'Очистить поиск', searching: 'Ищем продукты…',
    submit: 'Найти', searchHint: 'Введите название и нажмите «Найти» или «Поиск» на клавиатуре.', minimumQuery: 'Для поиска введите хотя бы 2 символа.',
    rateLimited: 'Слишком много запросов', rateHint: 'Попробуйте немного позже.', lastSearch: 'Предыдущий поиск',
    source: 'Данные', license: 'Лицензия', remoteNote: 'Поиск отправляется в Open Food Facts.',
    suggestions: 'Популярные', recents: 'Недавние', recentUnavailable: 'Недавние пока недоступны',
    catalogNote: 'Демонстрационный каталог · пищевая ценность примерная',
    noResults: 'Ничего не нашлось', noResultsHint: 'Попробуйте другое название или бренд.',
    error: 'Не удалось найти продукты', errorHint: 'Проверьте подключение к интернету и попробуйте ещё раз.', retry: 'Повторить поиск',
    custom: 'Создать свой · скоро', notFound: 'Не нашли продукт?', per100: 'На 100 г',
    quantity: 'Количество', grams: 'г', kcal: 'ккал', meal: 'Приём пищи', add: 'Добавить в дневник', addShort: 'Добавить',
    done: 'Готово', close: 'Вернуться к поиску', portion: 'В выбранной порции',
    invalidQuantity: 'Введите количество больше нуля, до трёх знаков после запятой.',
    saveError: 'Не удалось добавить продукт. Попробуйте ещё раз.',
    invalidContext: 'Не удалось открыть выбранный приём пищи.', back: 'Вернуться к дневнику',
    protein: 'Белки', fat: 'Жиры', carbs: 'Углеводы', p: 'Б', f: 'Ж', c: 'У', select: 'Выбрать продукт',
  },
  en: {
    title: 'Add food', search: 'Search foods', clear: 'Clear search', searching: 'Searching foods…',
    submit: 'Search', searchHint: 'Enter a food name, then tap Search or use the keyboard Search key.', minimumQuery: 'Enter at least 2 characters to search.',
    rateLimited: 'Too many requests', rateHint: 'Please try again later.', lastSearch: 'Previous search',
    source: 'Data', license: 'License', remoteNote: 'Search is sent to Open Food Facts.',
    suggestions: 'Popular', recents: 'Recent', recentUnavailable: 'Recent foods are unavailable',
    catalogNote: 'Demo catalog · illustrative nutrition values',
    noResults: 'Nothing found', noResultsHint: 'Try another food name or brand.',
    error: 'Could not find foods', errorHint: 'Please try again shortly.', retry: 'Try search again',
    custom: 'Create your own · soon', notFound: 'Missing a food?', per100: 'Per 100 g',
    quantity: 'Quantity', grams: 'g', kcal: 'kcal', meal: 'Meal', add: 'Add to diary', addShort: 'Add',
    done: 'Done', close: 'Return to search', portion: 'In this portion',
    invalidQuantity: 'Enter a positive amount with up to three decimal places.',
    saveError: 'Could not add food. Please try again.', invalidContext: 'Could not open the selected meal.', back: 'Return to diary',
    protein: 'Protein', fat: 'Fat', carbs: 'Carbs', p: 'P', f: 'F', c: 'C', select: 'Select food',
  },
};
export const getFoodCatalogMessages = (locale: AppLocale) => translations[locale];
export type FoodCatalogCopy = ReturnType<typeof getFoodCatalogMessages>;
export function foodNutrientLine(nutrients: Nutrients, locale: AppLocale) {
  const copy = getFoodCatalogMessages(locale), { number } = nutritionFormatters(locale);
  return `${number(nutrients.energyCentiKcal / 100)} ${copy.kcal} · ${copy.p} ${number(nutrients.proteinMg / 1000, 1)} · ${copy.f} ${number(nutrients.fatMg / 1000, 1)} · ${copy.c} ${number(nutrients.carbsMg / 1000, 1)}`;
}
