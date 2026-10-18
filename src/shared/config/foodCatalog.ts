import { expo } from '../../../app.json';

/** Public lookup context, not credentials. Replace market/preferences when settings exist. */
export const foodCatalogConfig = {
  userAgent: `ChebuFit/${expo.version} (https://github.com/Ruslon69/ChebuFit)`,
  languages: ['ru', 'en', 'nl'],
  countryCode: 'nl',
} as const;
