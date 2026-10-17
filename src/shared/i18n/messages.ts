type Messages = {
  developmentPlaceholder: string;
};

const translations = {
  en: {
    developmentPlaceholder: 'Application foundation ready.',
  },
} satisfies Record<string, Messages>;

export type AppLocale = keyof typeof translations;

export function getMessages(locale: AppLocale): Messages {
  return translations[locale];
}
