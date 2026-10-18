import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { DailyWaterRecord, LocalDateKey, WaterError } from '../../features/water';
import { getLocalDateKey } from '../../shared/utils/localCalendar';
import { waterService } from './water';

type GoalCrossing = Readonly<{ localDate: LocalDateKey; occurredAt: string }>;

/** Composition only: the feature owns quantities; the caller owns reward orchestration. */
export function useDailyWater(onGoalCrossed: (fact: GoalCrossing) => void) {
  const [record, setRecord] = useState<DailyWaterRecord | null>(null);
  const [error, setError] = useState<WaterError | null>(null);
  const mounted = useRef(false);
  const accept = useCallback((next: DailyWaterRecord) => {
    if (mounted.current && next.localDate === getLocalDateKey(new Date())) { setRecord(next); setError(null); }
  }, []);
  const refresh = useCallback(async () => {
    const localDate = getLocalDateKey(new Date());
    setRecord(current => current?.localDate === localDate ? current : null);
    const result = await waterService.getDay(localDate);
    if (!result.ok && mounted.current) { setError(result.error); if (__DEV__) console.warn('[Water] Could not load daily record:', result.error); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    const unsubscribe = waterService.subscribe(accept);
    const foreground = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); });
    return () => { mounted.current = false; unsubscribe(); foreground.remove(); };
  }, [accept, refresh]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const addWater = useCallback(async (amountMl: number) => {
    const now = new Date();
    const fact = { localDate: getLocalDateKey(now), occurredAt: now.toISOString() };
    setRecord(current => current?.localDate === fact.localDate ? current : null);
    const result = await waterService.addWater(amountMl, fact.localDate);
    if (!result.ok) {
      if (mounted.current) setError(result.error);
      if (__DEV__) console.warn('[Water] Addition was not saved:', result.error);
      return;
    }
    // Save succeeded. Reads, corrections, and already-above-goal adds never emit this fact.
    if (result.value.crossedGoal) onGoalCrossed(fact);
  }, [onGoalCrossed]);
  const removeWater = useCallback(async (amountMl: number) => {
    const localDate = getLocalDateKey(new Date());
    setRecord(current => current?.localDate === localDate ? current : null);
    const result = await waterService.removeWater(amountMl, localDate);
    if (!result.ok) {
      if (mounted.current) setError(result.error);
      if (__DEV__) console.warn('[Water] Correction was not saved:', result.error);
    }
    // Corrections update tracking only; they never rewrite or reverse rewards.
  }, []);
  // Keep controls responsive: every accepted tap queues in WaterService, with
  // no optimistic quantity or competing UI-side read/modify/write calculation.
  return { record, error, addWater, removeWater };
}
