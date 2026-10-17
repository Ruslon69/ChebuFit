import type { AppLocale } from '../../../shared/i18n/messages';
import type { MacroId, MealId } from './TodayViewModel';

type TodayMessages = {
  greetings: Record<'morning' | 'afternoon' | 'evening', string>;
  profile: string;
  orangeBalanceLabel: (balance: number, formattedBalance: string) => string;
  orangeBalanceUnavailable: string;
  calories: string;
  consumed: string;
  remaining: string;
  target: string;
  kcal: string;
  grams: string;
  litres: string;
  kg: string;
  macros: Record<MacroId, string>;
  water: string;
  waterRemaining: (litres: string) => string;
  waterAdd: (ml: number) => string;
  waterComplete: string;
  nutrition: string;
  allMeals: string;
  meals: Record<MealId, string>;
  workout: string;
  workoutDetails: (count: number, minutes: number) => string;
  startWorkout: string;
  weight: string;
  history: string;
  weightPeriod: (days: number) => string;
  previewTitle: string;
  profilePreview: string;
  workoutPreview: string;
  dismiss: string;
};

const messages = {
  ru: {
    orangeBalanceUnavailable: 'Баланс пока недоступен',
    greetings: { morning: 'Доброе утро', afternoon: 'Добрый день', evening: 'Добрый вечер' },
    profile: 'Открыть профиль', calories: 'Калории', consumed: 'ккал съедено',
    orangeBalanceLabel: (balance: number, formattedBalance: string) => {
      const lastTwo = Math.abs(balance) % 100;
      const lastDigit = Math.abs(balance) % 10;
      const unit = lastTwo >= 11 && lastTwo <= 14 ? 'апельсинов'
        : lastDigit === 1 ? 'апельсин'
        : lastDigit >= 2 && lastDigit <= 4 ? 'апельсина' : 'апельсинов';
      return `Баланс: ${formattedBalance} ${unit}`;
    },
    remaining: 'Осталось', target: 'Цель', kcal: 'ккал', grams: 'г', litres: 'л', kg: 'кг',
    macros: { protein: 'Белки', fat: 'Жиры', carbs: 'Углеводы' },
    water: 'Вода', waterRemaining: (litres: string) => `Ещё ${litres} л до цели`,
    waterAdd: (ml: number) => `+${ml} мл`, waterComplete: 'Цель достигнута',
    nutrition: 'Питание', allMeals: 'Все приёмы',
    meals: { breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', snacks: 'Перекусы' },
    workout: 'Сегодняшняя тренировка',
    workoutDetails: (count: number, minutes: number) => `${count} упражнений · ~${minutes} мин`,
    startWorkout: 'Начать тренировку', weight: 'Вес', history: 'История',
    weightPeriod: (days: number) => `за ${days} дней`,
    previewTitle: 'Скоро в ChebuFit', profilePreview: 'Профиль появится на следующем этапе.',
    workoutPreview: 'Экран активной тренировки появится на следующем этапе. Тренировка пока не запускается.',
    dismiss: 'Понятно',
  },
  en: {
    orangeBalanceUnavailable: 'Balance is currently unavailable',
    greetings: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
    profile: 'Open profile', calories: 'Calories', consumed: 'kcal eaten',
    orangeBalanceLabel: (balance: number, formattedBalance: string) => `Balance: ${formattedBalance} ${balance === 1 ? 'orange' : 'oranges'}`,
    remaining: 'Remaining', target: 'Goal', kcal: 'kcal', grams: 'g', litres: 'l', kg: 'kg',
    macros: { protein: 'Protein', fat: 'Fat', carbs: 'Carbs' },
    water: 'Water', waterRemaining: (litres: string) => `${litres} l to go`,
    waterAdd: (ml: number) => `+${ml} ml`, waterComplete: 'Goal reached',
    nutrition: 'Nutrition', allMeals: 'All meals',
    meals: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' },
    workout: "Today's workout",
    workoutDetails: (count: number, minutes: number) => `${count} exercises · ~${minutes} min`,
    startWorkout: 'Start workout', weight: 'Weight', history: 'History',
    weightPeriod: (days: number) => `over ${days} days`,
    previewTitle: 'Coming to ChebuFit', profilePreview: 'Profile will be available in a later stage.',
    workoutPreview: 'The active workout screen will be added later. No workout has started.', dismiss: 'Got it',
  },
} satisfies Record<AppLocale, TodayMessages>;

export function getTodayMessages(locale: AppLocale): TodayMessages {
  return messages[locale];
}

export function createTodayFormatters(locale: AppLocale) {
  const language = locale === 'ru' ? 'ru-RU' : 'en-US';
  return {
    number: (value: number) => new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(value),
    weight: (value: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value),
    change: (value: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'exceptZero' }).format(value),
    date: (value: string) => {
      const text = new Intl.DateTimeFormat(language, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Amsterdam' }).format(new Date(value));
      return text.charAt(0).toLocaleUpperCase(language) + text.slice(1);
    },
  };
}

export type TodayCopy = ReturnType<typeof getTodayMessages>;
export type TodayFormatters = ReturnType<typeof createTodayFormatters>;
