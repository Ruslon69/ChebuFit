import type { Nutrients } from '../../nutrition/domain/types';

export type CatalogFood = Readonly<{
  source: Readonly<{ providerId: string; foodId: string }>;
  name: string;
  brand?: string;
  barcode?: string;
  imageUrl?: string;
  basis: 'per100g';
  nutrients: Nutrients;
  /** Future serving adapters resolve this into canonical grams. No serving UI yet. */
  serving?: Readonly<{ label: string; grams: number }>;
}>;
export type FoodSearchQuery = Readonly<{ text: string }>;
export type FoodSearchContext = Readonly<{ signal?: AbortSignal; limit?: number; cursor?: string; languages?: readonly string[]; countryCode?: string }>;
export type FoodSearchResult = Readonly<{ foods: readonly CatalogFood[]; nextCursor?: string }>;
export type CatalogError = 'providerUnavailable' | 'invalidFood' | 'storageUnavailable' | 'corruptData' | 'unsupportedSchema'
  | 'network' | 'timeout' | 'rateLimited' | 'server' | 'malformedResponse' | 'invalidQuery' | 'invalidBarcode' | 'cancelled';
export type CatalogResult<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; error: CatalogError; retryAfterMs?: number }>;
export interface FoodCatalogProvider {
  readonly searchPolicy?: Readonly<{ trigger: 'submit'; minimumLength: number }>;
  readonly attribution?: Readonly<{ name: string; url: string; license: string; licenseUrl: string }>;
  readonly disclosure?: 'illustrativeNutrition';
  searchFoods(query: FoodSearchQuery, context?: FoodSearchContext): Promise<CatalogResult<FoodSearchResult>>;
  getSuggestions(context?: FoodSearchContext): Promise<CatalogResult<readonly CatalogFood[]>>;
  getByBarcode?(barcode: string, context?: FoodSearchContext): Promise<CatalogResult<CatalogFood | null>>;
}
export type RecentFood = Readonly<{ food: CatalogFood; addedAt: string }>;
export interface RecentFoodsRepository {
  load(): Promise<CatalogResult<readonly RecentFood[]>>;
  record(food: CatalogFood, addedAt: string): Promise<CatalogResult<void>>;
  remove?(source: CatalogFood['source']): Promise<CatalogResult<void>>;
}
