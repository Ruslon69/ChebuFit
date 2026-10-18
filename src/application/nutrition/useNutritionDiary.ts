import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { DailyNutritionView, LocalDateKey, NutritionError } from '../../features/nutrition';
import { getLocalDateKey } from '../../shared/utils/localCalendar';
import { nutritionService } from './nutrition';

type DiaryState = { status: 'loading'; view: null } | { status: 'ready'; view: DailyNutritionView } | { status: 'error'; view: null; error: NutritionError };
export function useNutritionDiary(localDate: LocalDateKey) {
  const [state, setState] = useState<DiaryState>({ status: 'loading', view: null });
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setState(current => current.view?.diary.localDate === localDate ? current : { status: 'loading', view: null });
    const result = await nutritionService.getDay(localDate, { readOnly: localDate !== getLocalDateKey(new Date()) });
    if (generation.current !== request) return;
    setState(result.ok ? { status: 'ready', view: result.value } : { status: 'error', view: null, error: result.error });
  }, [localDate]);
  useEffect(() => {
    const unsubscribe = nutritionService.subscribe(() => { void refresh(); });
    const listener = AppState.addEventListener('change', value => { if (value === 'active') void refresh(); });
    return () => { generation.current++; unsubscribe(); listener.remove(); };
  }, [refresh]);
  useFocusEffect(useCallback(() => { void refresh(); return () => { generation.current++; }; }, [refresh]));
  // Never show the previous date's totals under a newly selected date.
  return { state: state.view && state.view.diary.localDate !== localDate ? { status: 'loading' as const, view: null } : state, refresh };
}
