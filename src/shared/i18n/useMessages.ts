import { appConfig } from '../config/app';
import { getMessages } from './messages';

// Keep locale selection behind this hook when a user/device locale provider is added.
export function useMessages() {
  return getMessages(appConfig.defaultLocale);
}
