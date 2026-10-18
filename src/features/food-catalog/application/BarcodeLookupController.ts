import { normalizeFoodBarcode } from '../domain/barcode';
import { parseCatalogFood } from '../domain/catalogFood';
import type { CatalogError, CatalogFood, FoodCatalogProvider } from '../domain/types';
import type { LocalDateKey, MealType } from '../../nutrition/domain/types';

export type BarcodeContext = Readonly<{ date: LocalDateKey; meal: MealType }>;
export type BarcodeLookupState =
  | Readonly<{ status: 'idle' | 'invalid' }>
  | Readonly<{ status: 'lookingUp'; code: string }>
  | Readonly<{ status: 'found'; code: string; food: CatalogFood; context: BarcodeContext }>
  | Readonly<{ status: 'notFound'; code: string }>
  | Readonly<{ status: 'error'; code: string; error: CatalogError; retryAt?: number }>;

/** Discovery only. No diary, wallet, persistence or navigation dependencies. */
export function createBarcodeLookupController(provider: FoodCatalogProvider, context: BarcodeContext, now = Date.now) {
  let state: BarcodeLookupState = { status: 'idle' }, active = true, revision = 0;
  let abort: AbortController | undefined, last: { input: string; format?: string } | null = null;
  const listeners = new Set<() => void>(), capturedContext = { ...context };
  const emit = (next: BarcodeLookupState) => {
    state = next; for (const listener of listeners) { try { listener(); } catch { /* isolate presentation */ } }
  };
  const cancel = () => { revision++; abort?.abort(); };
  const submit = async (input: string, origin: 'camera' | 'manual', format?: string) => {
    // Lock synchronously, before awaiting the provider. Found/error states require an explicit reset.
    if (!active || (state.status !== 'idle' && state.status !== 'invalid')) return;
    const barcode = normalizeFoodBarcode(input, format);
    if (!barcode) { if (origin === 'manual') emit({ status: 'invalid' }); return; }
    last = { input, format }; const generation = ++revision; abort = new AbortController();
    emit({ status: 'lookingUp', code: barcode.displayCode });
    try {
      const result = provider.getByBarcode ? await provider.getByBarcode(barcode.lookupCode, { signal: abort.signal })
        : { ok: false, error: 'providerUnavailable' } as const;
      if (!active || generation !== revision) return;
      if (!result.ok) {
        emit({ status: 'error', code: barcode.displayCode, error: result.error,
          ...(result.retryAfterMs ? { retryAt: now() + result.retryAfterMs } : {}) }); return;
      }
      if (result.value === null) { emit({ status: 'notFound', code: barcode.displayCode }); return; }
      const food = parseCatalogFood(result.value);
      if (!food.ok) { emit({ status: 'error', code: barcode.displayCode, error: 'invalidFood' }); return; }
      emit({ status: 'found', code: barcode.displayCode, food: food.value, context: capturedContext });
    } catch { if (active && generation === revision) emit({ status: 'error', code: barcode.displayCode, error: 'network' }); }
  };
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    submit,
    reset() { cancel(); last = null; emit({ status: 'idle' }); },
    retry() {
      if (!active || state.status !== 'error' || !last || (state.retryAt && now() < state.retryAt)) return;
      const candidate = last; emit({ status: 'idle' }); return submit(candidate.input, 'manual', candidate.format);
    },
    setActive(next: boolean) { active = next; if (!next) { cancel(); if (state.status === 'lookingUp') emit({ status: 'idle' }); } },
  };
}
