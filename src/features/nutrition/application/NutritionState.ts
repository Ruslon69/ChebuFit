import { isLocalDateKey } from '../../../shared/utils/localCalendar';
import type { DailyNutritionDiary, NutritionDiaryEntry, NutritionEntryId, NutritionResult, NutritionTargets, LocalDateKey } from '../domain/types';
import { calculateNutritionSummary, defaultNutritionTargets, isGramQuantity, isMealType, isObject, isTargets, isText, isTimestamp, parseFoodSnapshot } from '../domain/nutrition';

export type NutritionMode = 'real' | 'developmentDemo';
export type NutritionStateV1 = Readonly<{
  schemaVersion: 1;
  mode: NutritionMode;
  targets: NutritionTargets;
  developmentSeed: Readonly<{ version: 1; localDate: LocalDateKey | null }> | null;
  diaries: readonly DailyNutritionDiary[];
}>;
export function createInitialNutritionState(mode: NutritionMode): NutritionStateV1 {
  return { schemaVersion: 1, mode, targets: { ...defaultNutritionTargets },
    developmentSeed: mode === 'developmentDemo' ? { version: 1, localDate: null } : null, diaries: [] };
}
export function decodeNutritionState(data: unknown, mode: NutritionMode): NutritionResult<NutritionStateV1> {
  const corrupt = { ok: false, error: 'corruptData' } as const;
  if (!isObject(data)) return corrupt;
  if (typeof data.schemaVersion === 'number' && data.schemaVersion > 1) return { ok: false, error: 'unsupportedSchema' };
  if (data.schemaVersion !== 1 || data.mode !== mode || !isTargets(data.targets) || !Array.isArray(data.diaries)) return corrupt;
  let developmentSeed: NutritionStateV1['developmentSeed'] = null;
  if (mode === 'developmentDemo') {
    if (!isObject(data.developmentSeed) || data.developmentSeed.version !== 1
      || !(data.developmentSeed.localDate === null || isLocalDateKey(data.developmentSeed.localDate))) return corrupt;
    developmentSeed = { version: 1, localDate: data.developmentSeed.localDate };
  } else if (data.developmentSeed !== null) return corrupt;
  const dates = new Set<string>(), ids = new Set<string>(), diaries: DailyNutritionDiary[] = [];
  for (const diary of data.diaries) {
    if (!isObject(diary) || !isLocalDateKey(diary.localDate) || dates.has(diary.localDate) || !Array.isArray(diary.entries)
      || !isTimestamp(diary.createdAt) || !isTimestamp(diary.updatedAt) || Date.parse(diary.updatedAt) < Date.parse(diary.createdAt)) return corrupt;
    dates.add(diary.localDate);
    const entries: NutritionDiaryEntry[] = [];
    for (const entry of diary.entries) {
      if (!isObject(entry) || !isText(entry.id) || ids.has(entry.id) || entry.localDate !== diary.localDate
        || !isMealType(entry.meal) || !isGramQuantity(entry.quantity) || !isTimestamp(entry.createdAt) || !isTimestamp(entry.updatedAt)
        || Date.parse(entry.updatedAt) < Date.parse(entry.createdAt) || Date.parse(entry.updatedAt) > Date.parse(diary.updatedAt)) return corrupt;
      const food = parseFoodSnapshot(entry.food);
      if (!food.ok) return corrupt;
      ids.add(entry.id);
      entries.push({ id: entry.id as NutritionEntryId, localDate: diary.localDate, meal: entry.meal, food: food.value,
        quantity: { unit: 'g', milliGrams: entry.quantity.milliGrams }, createdAt: entry.createdAt, updatedAt: entry.updatedAt });
    }
    if (!calculateNutritionSummary(entries, data.targets).ok) return corrupt;
    diaries.push({ localDate: diary.localDate, entries, createdAt: diary.createdAt, updatedAt: diary.updatedAt });
  }
  if (developmentSeed && (developmentSeed.localDate === null ? diaries.length !== 0 : !dates.has(developmentSeed.localDate))) return corrupt;
  return { ok: true, value: { schemaVersion: 1, mode, targets: { energyCentiKcal: data.targets.energyCentiKcal, proteinMg: data.targets.proteinMg, fatMg: data.targets.fatMg, carbsMg: data.targets.carbsMg }, developmentSeed, diaries } };
}
