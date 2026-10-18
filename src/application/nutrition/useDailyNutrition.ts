import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { DailyNutritionView, NutritionError } from '../../features/nutrition';
import { getLocalDateKey } from '../../shared/utils/localCalendar';
import { nutritionService } from './nutrition';

type State = { status: 'loading'; view: null } | { status: 'ready'; view: DailyNutritionView } | { status: 'error'; view: null; error: NutritionError };
export function useDailyNutrition(): State {
  const [state, setState] = useState<State>({ status: 'loading', view: null });
  const mounted = useRef(false), revision = useRef(0);
  const refresh = useCallback(async () => {
    const localDate = getLocalDateKey(new Date()), request = ++revision.current;
    setState(current => current.view?.diary.localDate === localDate ? current : { status: 'loading', view: null });
    const result = await nutritionService.getDay(localDate);
    if (!mounted.current || request !== revision.current || localDate !== getLocalDateKey(new Date())) return;
    setState(result.ok ? { status: 'ready', view: result.value } : { status: 'error', view: null, error: result.error });
    if (!result.ok && __DEV__) console.warn('[Nutrition] Diary unavailable:', result.error);
  }, []);
  useEffect(() => {
    mounted.current = true;
    const unsubscribe = nutritionService.subscribe(() => { void refresh(); });
    const foreground = AppState.addEventListener('change', value => { if (value === 'active') void refresh(); });
    return () => { mounted.current = false; revision.current++; unsubscribe(); foreground.remove(); };
  }, [refresh]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  return state;
}
