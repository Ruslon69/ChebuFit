import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useFocusEffect } from 'expo-router';
import { createFoodSearchController } from '../../features/food-catalog/application/FoodSearchController';
import type { RecentFood } from '../../features/food-catalog/domain/types';
import { foodCatalogProvider, recentFoodsRepository } from './catalog';
import { personalFoodService } from '../personal-foods/personalFoods';
import { reconcilePersonalRecents, type PersonalFood } from '../../features/personal-foods/domain/personalFood';

export function useFoodSearch() {
  const [search] = useState(() => createFoodSearchController(foodCatalogProvider));
  const state = useSyncExternalStore(search.subscribe, search.getSnapshot, search.getSnapshot);
  const [recents, setRecents] = useState<readonly RecentFood[]>([]), [recentFailed, setRecentFailed] = useState(false);
  const [personalFoods, setPersonalFoods] = useState<readonly PersonalFood[]>([]), [personalFailed, setPersonalFailed] = useState(false);
  useFocusEffect(useCallback(() => {
    let active = true, generation = 0;
    const refresh = async () => {
      const request = ++generation;
      const [local, recent] = await Promise.all([personalFoodService.getAll(), recentFoodsRepository.load()]);
      if (!active || request !== generation) return;
      setPersonalFailed(!local.ok); setPersonalFoods(local.ok ? local.value : []);
      setRecentFailed(!recent.ok); setRecents(recent.ok ? recent.value.filter(item => foodCatalogProvider.disclosure === 'illustrativeNutrition' || item.food.source.providerId !== 'chebufit-development') : []);
    };
    void refresh(); const unsubscribe = personalFoodService.subscribe(() => void refresh());
    return () => { active = false; unsubscribe(); };
  }, []));
  useEffect(() => {
    void search.start();
    return () => { search.dispose(); };
  }, [search]);
  const currentRecents = useMemo(() => reconcilePersonalRecents(recents, personalFoods), [recents, personalFoods]);
  return { state, search, recents: currentRecents, recentFailed, personalFoods, personalFailed, disclosure: foodCatalogProvider.disclosure, attribution: foodCatalogProvider.attribution };
}
