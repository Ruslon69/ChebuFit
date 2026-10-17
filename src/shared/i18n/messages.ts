type Messages = {
  navigation: {
    today: string;
    nutrition: string;
    workouts: string;
    progress: string;
    onboarding: string;
    designSystem: string;
  };
  development: {
    screenSubtitle: string;
    onboardingSubtitle: string;
    continueToApp: string;
  };
  quickAdd: {
    open: string;
    close: string;
    title: string;
    subtitle: string;
    actionHint: string;
    actions: Record<'food' | 'barcode' | 'water' | 'workout' | 'weight' | 'measurement', string>;
  };
};

const translations = {
  en: {
    quickAdd: {
      open: 'Quick add', close: 'Close quick add', title: 'Quick add',
      subtitle: 'Choose an action for your day.', actionHint: 'This action is not available yet.',
      actions: { food: 'Add food', barcode: 'Scan a product', water: 'Add water', workout: 'Add a workout', weight: 'Add weight', measurement: 'Add a measurement' },
    },
    navigation: {
      today: 'Today', nutrition: 'Nutrition', workouts: 'Workouts',
      progress: 'Progress', onboarding: 'Welcome', designSystem: 'Design system',
    },
    development: {
      screenSubtitle: 'This section is under development.',
      onboardingSubtitle: 'Onboarding will be introduced here.',
      continueToApp: 'Continue to the app',
    },
  },
  ru: {
    quickAdd: {
      open: 'Быстро добавить', close: 'Закрыть быстрые действия', title: 'Быстро добавить',
      subtitle: 'Всё нужное для вашего дня.', actionHint: 'Действие пока недоступно.',
      actions: { food: 'Добавить еду', barcode: 'Сканировать продукт', water: 'Добавить воду', workout: 'Добавить тренировку', weight: 'Добавить вес', measurement: 'Добавить замер' },
    },
    navigation: {
      today: 'Сегодня', nutrition: 'Питание', workouts: 'Тренировки',
      progress: 'Прогресс', onboarding: 'Знакомство', designSystem: 'Дизайн-система',
    },
    development: {
      screenSubtitle: 'Раздел находится в разработке.',
      onboardingSubtitle: 'Здесь появится первоначальная настройка.',
      continueToApp: 'Перейти к приложению',
    },
  },
} satisfies Record<string, Messages>;

export type AppLocale = keyof typeof translations;

export function getMessages(locale: AppLocale): Messages {
  return translations[locale];
}
