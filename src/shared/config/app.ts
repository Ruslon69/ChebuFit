import { expo } from '../../../app.json';
import type { AppLocale } from '../i18n/messages';

export const appConfig = {
  displayName: expo.name,
  defaultLocale: 'en' satisfies AppLocale,
} as const;
