import type { AppLocale } from '../../../shared/i18n/messages';

const messages = {
  ru: {
    entry: 'Сканировать штрихкод', title: 'Сканировать продукт', checking: 'Проверяем доступ к камере…',
    permissionTitle: 'Штрихкод — и продукт найден', permission: 'Для сканирования штрихкода нужен доступ к камере. Снимки и видео никуда не отправляются.',
    allow: 'Разрешить доступ', denied: 'Доступ к камере не разрешён', settingsHint: 'Разрешите доступ в настройках или введите код вручную.', settings: 'Открыть настройки',
    unavailable: 'Камера недоступна', unavailableHint: 'Можно найти продукт по коду с упаковки или по названию.',
    instruction: 'Наведите камеру на штрихкод', guide: 'Рамка помогает навести камеру. Код может распознаться и за её пределами.',
    manual: 'Ввести код вручную', manualTitle: 'Введите штрихкод', code: 'Штрихкод', find: 'Найти продукт',
    invalid: 'Проверьте штрихкод и попробуйте ещё раз.', looking: 'Ищем продукт…',
    notFound: 'Продукт не найден', notFoundHint: 'В базе пока нет данных об этом продукте.',
    unusable: 'Недостаточно данных о продукте', unusableHint: 'Для дневника нужны калории, белки, жиры и углеводы. Попробуйте поиск по названию.',
    lookupError: 'Не удалось проверить штрихкод', lookupHint: 'Проверьте подключение и попробуйте ещё раз.',
    retry: 'Повторить', search: 'Искать по названию', another: 'Ввести другой код', rescan: 'Сканировать снова',
    shortCode: 'Короткий код UPC-E', shortHint: 'Выберите для восьмизначного UPC-E. Обычный EAN-8 оставьте без отметки.',
    settingsError: 'Не удалось открыть настройки. Введите код вручную.',
  },
  en: {
    entry: 'Scan barcode', title: 'Scan product', checking: 'Checking camera access…',
    permissionTitle: 'Find a product by barcode', permission: 'Camera access is needed to scan barcodes. Photos and video are never uploaded.',
    allow: 'Allow camera access', denied: 'Camera access is not allowed', settingsHint: 'Allow access in Settings or enter the code manually.', settings: 'Open Settings',
    unavailable: 'Camera unavailable', unavailableHint: 'Enter the code from the package or search by name.',
    instruction: 'Point the camera at the barcode', guide: 'The frame is a guide. Codes outside it may also be detected.',
    manual: 'Enter code manually', manualTitle: 'Enter barcode', code: 'Barcode', find: 'Find product',
    invalid: 'Check the barcode and try again.', looking: 'Looking up product…',
    notFound: 'Product not found', notFoundHint: 'This product is not in the database yet.',
    unusable: 'Incomplete product information', unusableHint: 'Calories, protein, fat and carbs are needed for the diary. Try searching by name.',
    lookupError: 'Could not check barcode', lookupHint: 'Check your connection and try again.',
    retry: 'Retry', search: 'Search by name', another: 'Enter another code', rescan: 'Scan again',
    shortCode: 'Short UPC-E code', shortHint: 'Select for an eight-digit UPC-E. Leave off for a standard EAN-8.',
    settingsError: 'Could not open Settings. Enter the code manually.',
  },
};
export const getScannerMessages = (locale: AppLocale) => messages[locale];
