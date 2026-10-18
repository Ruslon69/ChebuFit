import type { AppLocale } from '../../../shared/i18n/messages';
const messages = {
  ru: {
    create: 'Создать продукт', edit: 'Редактировать продукт', mine: 'Мои продукты', badge: 'Мой продукт',
    name: 'Название продукта', brand: 'Бренд · необязательно', barcode: 'Штрихкод · необязательно', basis: 'На 100 г',
    energy: 'Калории', protein: 'Белки', fat: 'Жиры', carbs: 'Углеводы', kcal: 'ккал', grams: 'г',
    saveAdd: 'Сохранить и добавить', save: 'Сохранить', done: 'Готово', loading: 'Открываем продукт…',
    failed: 'Не удалось сохранить продукт. Попробуйте ещё раз.', loadFailed: 'Не удалось открыть личные продукты.', retry: 'Повторить',
    missing: 'Этот продукт больше недоступен в личном каталоге.', back: 'Вернуться к поиску',
    duplicate: 'Этот штрихкод уже привязан к вашему продукту:', use: 'Выбрать этот продукт',
    delete: 'Удалить продукт', deleteTitle: 'Удалить продукт из личного каталога?',
    deleteHint: 'Записи в дневнике и полученные апельсины останутся.', confirmDelete: 'Удалить', cancel: 'Отмена',
    deleteFailed: 'Не удалось удалить продукт. Попробуйте ещё раз.', personalUnavailable: 'Личные продукты пока недоступны. Попробуйте открыть поиск ещё раз.',
    errors: { name: 'Введите название продукта, до 200 символов.', brand: 'Проверьте бренд: не больше 120 символов.',
      energy: 'Укажите калорийность от 0 до 1 000 ккал, до двух знаков после запятой.',
      protein: 'Проверьте белки: от 0 до 100 г, до трёх знаков после запятой.', fat: 'Проверьте жиры: от 0 до 100 г, до трёх знаков после запятой.',
      carbs: 'Проверьте углеводы: от 0 до 100 г, до трёх знаков после запятой.', barcode: 'Проверьте штрихкод и попробуйте ещё раз.' },
  },
  en: {
    create: 'Create food', edit: 'Edit food', mine: 'My foods', badge: 'Personal food',
    name: 'Food name', brand: 'Brand · optional', barcode: 'Barcode · optional', basis: 'Per 100 g',
    energy: 'Calories', protein: 'Protein', fat: 'Fat', carbs: 'Carbs', kcal: 'kcal', grams: 'g',
    saveAdd: 'Save and add', save: 'Save', done: 'Done', loading: 'Opening food…',
    failed: 'Could not save food. Please try again.', loadFailed: 'Could not open personal foods.', retry: 'Retry',
    missing: 'This food is no longer available in your personal catalog.', back: 'Return to search',
    duplicate: 'This barcode already belongs to your food:', use: 'Select this food',
    delete: 'Delete food', deleteTitle: 'Delete this personal food?', deleteHint: 'Diary entries and earned oranges will remain.',
    confirmDelete: 'Delete', cancel: 'Cancel', deleteFailed: 'Could not delete food. Please try again.', personalUnavailable: 'Personal foods are unavailable. Please reopen search to retry.',
    errors: { name: 'Enter a food name, up to 200 characters.', brand: 'Check the brand: up to 120 characters.',
      energy: 'Enter 0–1,000 kcal with up to two decimal places.', protein: 'Enter 0–100 g protein with up to three decimal places.',
      fat: 'Enter 0–100 g fat with up to three decimal places.', carbs: 'Enter 0–100 g carbs with up to three decimal places.', barcode: 'Check the barcode and try again.' },
  },
};
export const getPersonalFoodMessages = (locale: AppLocale) => messages[locale];
