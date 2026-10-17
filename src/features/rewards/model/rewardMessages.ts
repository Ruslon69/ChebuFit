import type { AppLocale } from '../../../shared/i18n/messages';

export function getRewardMessages(locale: AppLocale) {
  return locale === 'ru' ? {
    unit: (amount: number) => {
      const lastTwo = amount % 100, last = amount % 10;
      return lastTwo >= 11 && lastTwo <= 14 ? 'апельсинов' : last === 1 ? 'апельсин' : last >= 2 && last <= 4 ? 'апельсина' : 'апельсинов';
    },
    phrase: 'Отлично! Апельсины уже у тебя.', welcomePhrase: 'Отличное начало! Апельсины уже у тебя.',
    received: 'Получено:', dismiss: 'Закрыть награду',
  } : {
    unit: (amount: number) => amount === 1 ? 'orange' : 'oranges',
    phrase: 'Nice! Your oranges are ready.', welcomePhrase: 'A great start! Your oranges are ready.',
    received: 'Received:', dismiss: 'Dismiss reward',
  };
}
