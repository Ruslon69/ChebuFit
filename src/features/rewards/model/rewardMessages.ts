import type { AppLocale } from '../../../shared/i18n/messages';

export function getRewardMessages(locale: AppLocale) {
  return locale === 'ru' ? {
    unit: (amount: number) => {
      const lastTwo = amount % 100, last = amount % 10;
      return lastTwo >= 11 && lastTwo <= 14 ? 'апельсинов' : last === 1 ? 'апельсин' : last >= 2 && last <= 4 ? 'апельсина' : 'апельсинов';
    },
    micro: 'Отлично!', welcomeTitle: 'Добро пожаловать!', milestoneTitle: 'Новый рубеж!',
    phrase: 'Апельсины уже у тебя.', welcomePhrase: 'Первые апельсины уже у тебя.',
    received: 'Получено:', dismiss: 'Закрыть награду',
  } : {
    unit: (amount: number) => amount === 1 ? 'orange' : 'oranges',
    micro: 'Nice!', welcomeTitle: 'Welcome!', milestoneTitle: 'A new milestone!',
    phrase: 'Your oranges are ready.', welcomePhrase: 'Your first oranges are here.',
    received: 'Received:', dismiss: 'Dismiss reward',
  };
}
