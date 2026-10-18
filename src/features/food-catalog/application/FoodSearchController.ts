import { catalogFoodIdentity, parseCatalogFood } from '../domain/catalogFood';
import type { CatalogError, CatalogFood, FoodCatalogProvider } from '../domain/types';

export type FoodSearchState =
  | Readonly<{ status: 'initial'; foods: readonly CatalogFood[]; loading: boolean; failed: boolean }>
  | Readonly<{ status: 'ready'; query: string }>
  | Readonly<{ status: 'searching'; query: string }>
  | Readonly<{ status: 'results' | 'empty'; query: string; foods: readonly CatalogFood[] }>
  | Readonly<{ status: 'error'; query: string; error?: CatalogError; retryAt?: number }>;
type Scheduler = { set(callback: () => void, ms: number): unknown; clear(handle: unknown): void };
export function createFoodSearchController(provider: FoodCatalogProvider, options: { delayMs?: number; scheduler?: Scheduler } = {}) {
  const scheduler = options.scheduler ?? { set: (callback: () => void, ms: number) => setTimeout(callback, ms), clear: (handle: unknown) => clearTimeout(handle as ReturnType<typeof setTimeout>) };
  let state: FoodSearchState = { status: 'initial', foods: [], loading: true, failed: false };
  let suggestions: readonly CatalogFood[] = [], suggestionFailed = false, suggestionLoading = true;
  let previous: Readonly<{ query: string; foods: readonly CatalogFood[] }> | null = null;
  const minimumLength = provider.searchPolicy?.minimumLength ?? 1;
  let revision = 0, suggestionRevision = 0, query = '', timer: unknown, abort: AbortController | undefined;
  const listeners = new Set<() => void>();
  const emit = (next: FoodSearchState) => { state = next; for (const listener of listeners) { try { listener(); } catch { /* presentation subscriber isolation */ } } };
  const initial = () => emit({ status: 'initial', foods: suggestions, loading: suggestionLoading, failed: suggestionFailed });
  const validate = (foods: readonly CatalogFood[]) => {
    const parsed = foods.map(parseCatalogFood);
    if (parsed.some(food => !food.ok)) throw Error('Invalid catalog response');
    const seen = new Set<string>();
    return parsed.flatMap(food => {
      if (!food.ok || seen.has(catalogFoodIdentity(food.value))) return [];
      seen.add(catalogFoodIdentity(food.value)); return [food.value];
    });
  };
  const perform = async (text: string, generation: number) => {
    abort = new AbortController();
    try {
      const result = await provider.searchFoods({ text }, { signal: abort.signal, limit: 30 });
      if (generation !== revision) return;
      if (!result.ok) { emit({ status: 'error', query: text, error: result.error, ...(result.retryAfterMs ? { retryAt: Date.now() + result.retryAfterMs } : {}) }); return; }
      const foods = validate(result.value.foods);
      previous = { query: text, foods };
      emit({ status: foods.length ? 'results' : 'empty', query: text, foods });
    } catch { if (generation === revision) emit({ status: 'error', query: text }); }
  };
  const loadSuggestions = async () => {
    const generation = ++suggestionRevision;
    suggestionLoading = true; suggestionFailed = false; if (!query) initial();
    try {
      const result = await provider.getSuggestions();
      if (generation !== suggestionRevision) return;
      suggestions = result.ok ? validate(result.value) : []; suggestionFailed = !result.ok;
    } catch { if (generation !== suggestionRevision) return; suggestions = []; suggestionFailed = true; }
    suggestionLoading = false; if (!query) initial();
  };
  return {
    getSnapshot: () => state,
    getPrevious: () => previous,
    policy: provider.searchPolicy,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    start: loadSuggestions,
    setQuery(raw: string) {
      const text = raw.trim(); query = text; const generation = ++revision;
      scheduler.clear(timer); abort?.abort();
      if (!query) { initial(); return; }
      if (provider.searchPolicy?.trigger === 'submit') { emit({ status: 'ready', query }); return; }
      emit({ status: 'searching', query });
      timer = scheduler.set(() => { void perform(text, generation); }, options.delayMs ?? 300);
    },
    submit() {
      if (Array.from(query).length < minimumLength || state.status === 'searching') return;
      if ((state.status === 'results' || state.status === 'empty') && state.query === query) return;
      const generation = ++revision; scheduler.clear(timer); abort?.abort();
      emit({ status: 'searching', query }); return perform(query, generation);
    },
    retry() { if (!query) return loadSuggestions(); if (Array.from(query).length < minimumLength || state.status === 'searching' || (state.status === 'error' && state.retryAt && Date.now() < state.retryAt)) return; const generation = ++revision; scheduler.clear(timer); abort?.abort(); emit({ status: 'searching', query }); return perform(query, generation); },
    dispose() { revision++; suggestionRevision++; scheduler.clear(timer); abort?.abort(); },
  };
}
