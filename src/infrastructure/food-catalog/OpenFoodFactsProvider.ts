import type { CatalogError, CatalogResult, FoodCatalogProvider, FoodSearchContext } from '../../features/food-catalog/domain/types';
import { isObject } from '../../features/nutrition/domain/nutrition';
import { isOffBarcode, mapOpenFoodFactsProduct } from './openFoodFactsMapping';

export const offAttribution = {
  name: 'Open Food Facts', url: 'https://world.openfoodfacts.org',
  license: 'ODbL 1.0', licenseUrl: 'https://opendatacommons.org/licenses/odbl/1-0/',
} as const;
export type OpenFoodFactsOptions = Readonly<{
  userAgent: string; languages: readonly string[]; countryCode: string;
  fetch?: typeof fetch; now?: () => number; timeoutMs?: number;
}>;
const failed = (error: CatalogError, retryAfterMs?: number): CatalogResult<never> => ({ ok: false, error, ...(retryAfterMs === undefined ? {} : { retryAfterMs }) });
export function createOpenFoodFactsProvider(options: OpenFoodFactsOptions): FoodCatalogProvider {
  const request = options.fetch ?? fetch, now = options.now ?? Date.now;
  let searchAfter = 0, readAfter = 0, blockedUntil = 0;
  const languagesFor = (context?: FoodSearchContext) => (context?.languages ?? options.languages).filter(l => /^[a-z]{2}$/.test(l)).slice(0, 4);
  const urlFor = (path: string, context?: FoodSearchContext, search = false) => {
    const languages = languagesFor(context), url = new URL(`https://world.openfoodfacts.org${path}`);
    url.searchParams.set('fields', ['code', 'product_name', ...languages.map(l => `product_name_${l}`), 'product_name_en', 'generic_name', 'brands', 'nutrition.aggregated_set', 'nutriments', 'quantity', 'nutrition_data_per', 'product_quantity_unit', 'serving_quantity', 'serving_quantity_unit', 'serving_size'].filter((f, i, all) => all.indexOf(f) === i).join(','));
    if (!search) url.searchParams.set('lc', languages[0] ?? 'en');
    // Global search avoids excluding imported products. Market context is used on exact reads.
    if (!search) url.searchParams.set('cc', /^[a-z]{2}$/i.test(context?.countryCode ?? options.countryCode) ? (context?.countryCode ?? options.countryCode).toLowerCase() : 'world');
    return url;
  };
  const get = async (url: URL, kind: 'search' | 'read', signal?: AbortSignal): Promise<CatalogResult<unknown>> => {
    if (signal?.aborted) return failed('cancelled');
    const allowedAt = Math.max(blockedUntil, kind === 'search' ? searchAfter : readAfter);
    if (now() < allowedAt) return failed('rateLimited', allowedAt - now());
    if (kind === 'search') searchAfter = now() + 12000; else readAfter = now() + 5000;
    const abort = new AbortController(); let timedOut = false;
    const cancel = () => abort.abort(); signal?.addEventListener('abort', cancel, { once: true });
    const timer = setTimeout(() => { timedOut = true; abort.abort(); }, options.timeoutMs ?? 20000);
    try {
      const response = await request(url.toString(), { method: 'GET', signal: abort.signal,
        headers: { Accept: 'application/json', 'User-Agent': options.userAgent }, credentials: 'omit' });
      if (response.status === 429 || response.status >= 500) {
        const retry = response.headers.get('retry-after');
        const delay = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : retry ? Math.max(0, Date.parse(retry) - now()) : 0;
        const cooldown = Math.max(Number.isFinite(delay) ? delay : 0, response.status === 429 ? 60000 : 30000);
        blockedUntil = Math.max(blockedUntil, now() + cooldown);
        return failed(response.status === 429 ? 'rateLimited' : 'server', cooldown);
      }
      if (kind === 'read' && response.status === 404) return { ok: true, value: null };
      if (!response.ok) return failed('providerUnavailable');
      try { return { ok: true, value: await response.json() }; }
      catch { return failed(timedOut ? 'timeout' : signal?.aborted ? 'cancelled' : 'malformedResponse'); }
    } catch { return failed(timedOut ? 'timeout' : signal?.aborted ? 'cancelled' : 'network'); }
    finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
  };
  return {
    searchPolicy: { trigger: 'submit', minimumLength: 2 }, attribution: offAttribution,
    async getSuggestions() { return { ok: true, value: [] }; }, // No remote discovery requests.
    async searchFoods(query, context) {
      const text = query.text.trim();
      if (Array.from(text).length < 2 || text.length > 200 || !/[\p{L}\p{N}]/u.test(text)) return failed('invalidQuery');
      const url = urlFor('/cgi/search.pl', context, true);
      for (const [key, value] of Object.entries({ search_terms: text, action: 'process', json: '1', page_size: '25' })) url.searchParams.set(key, value);
      const response = await get(url, 'search', context?.signal);
      if (!response.ok) return response;
      if (!isObject(response.value) || !Array.isArray(response.value.products)) return failed('malformedResponse');
      const seen = new Set<string>(), foods = [];
      for (const raw of response.value.products.slice(0, 25)) {
        const food = mapOpenFoodFactsProduct(raw, languagesFor(context));
        if (food && !seen.has(food.source.foodId)) { foods.push(food); seen.add(food.source.foodId); }
      }
      const requestedLimit = context?.limit ?? 20;
      const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 20) : 20;
      return { ok: true, value: { foods: foods.slice(0, limit) } };
    },
    async getByBarcode(barcode, context) {
      const code = barcode.trim(); if (!isOffBarcode(code)) return failed('invalidBarcode');
      const response = await get(urlFor(`/api/v3.6/product/${code}`, context), 'read', context?.signal);
      if (!response.ok) return response;
      if (response.value === null) return { ok: true, value: null };
      if (!isObject(response.value)) return failed('malformedResponse');
      if (isObject(response.value.result) && response.value.result.id === 'product_not_found') return { ok: true, value: null };
      if (!isObject(response.value.product)) return failed('malformedResponse');
      const food = mapOpenFoodFactsProduct(response.value.product, languagesFor(context));
      return food && food.barcode?.padStart(14, '0') === code.padStart(14, '0') ? { ok: true, value: food } : failed('invalidFood');
    },
  };
}
