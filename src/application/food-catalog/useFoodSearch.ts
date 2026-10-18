import { useEffect, useState, useSyncExternalStore } from 'react';
import { createFoodSearchController } from '../../features/food-catalog/application/FoodSearchController';
import type { RecentFood } from '../../features/food-catalog/domain/types';
import { foodCatalogProvider, recentFoodsRepository } from './catalog';

export function useFoodSearch() {
  const [search] = useState(() => createFoodSearchController(foodCatalogProvider));
  const state = useSyncExternalStore(search.subscribe, search.getSnapshot, search.getSnapshot);
  const [recents, setRecents] = useState<readonly RecentFood[]>([]), [recentFailed, setRecentFailed] = useState(false);
  useEffect(() => {
    let mounted = true;
    void search.start();
    void recentFoodsRepository.load().then(result => { if (mounted) { setRecentFailed(!result.ok); if (result.ok) setRecents(result.value); } });
    return () => { mounted = false; search.dispose(); };
  }, [search]);
  return { state, search, recents, recentFailed, disclosure: foodCatalogProvider.disclosure };
}
