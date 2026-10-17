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
};

const translations = {
  en: {
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
