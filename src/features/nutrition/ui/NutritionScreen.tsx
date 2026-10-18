import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, AppState, Pressable, StyleSheet, View } from 'react-native';
import { nutritionService } from '../../../application/nutrition/nutrition';
import { useNutritionDiary } from '../../../application/nutrition/useNutritionDiary';
import { appConfig } from '../../../shared/config/app';
import { getLocalDateKey } from '../../../shared/utils/localCalendar';
import { Screen } from '../../../shared/ui/Screen';
import { AppText } from '../../../shared/ui/AppText';
import { IconButton } from '../../../shared/ui/IconButton';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { tokens as t } from '../../../shared/theme/tokens';
import type { NutritionDiaryEntry } from '../domain/types';
import { addFoodRoute, shiftDiaryDate, toDiaryMeals } from '../model/diaryPresentation';
import { getNutritionMessages, nutritionFormatters } from '../model/messages';
import { MealSection, NutritionDailySummary } from './DiaryContent';
import { NutritionEntryEditor } from './NutritionEntryEditor';

export function NutritionScreen() {
  const router = useRouter(), locale = appConfig.defaultLocale;
  const copy = getNutritionMessages(locale), format = nutritionFormatters(locale);
  const [today, setToday] = useState(() => getLocalDateKey(new Date()));
  const [selectedDate, setSelectedDate] = useState(today), [editing, setEditing] = useState<NutritionDiaryEntry | null>(null);
  const syncDate = useCallback(() => {
    const current = getLocalDateKey(new Date());
    setSelectedDate(selected => selected === today || selected > current ? current : selected);
    setToday(current);
  }, [today]);
  useFocusEffect(useCallback(() => { syncDate(); }, [syncDate]));
  useEffect(() => { const sub = AppState.addEventListener('change', value => { if (value === 'active') syncDate(); }); return () => sub.remove(); }, [syncDate]);
  const { state, refresh } = useNutritionDiary(selectedDate);
  const meals = useMemo(() => state.view ? toDiaryMeals(state.view) : [], [state.view]);
  const changeDate = (date: typeof today) => { setEditing(null); setSelectedDate(date); };
  return (
    <>
      <Screen scroll edges={['top', 'left', 'right']} contentContainerStyle={styles.content} testID="nutrition-screen">
        <View style={styles.title}>
          <AppText maxFontSizeMultiplier={t.accessibility.headingTextScale} variant="pageTitle" style={styles.flex}>{copy.title}</AppText>
          <IconButton icon="home" variant="ghost" label={copy.overview} onPress={() => router.navigate('/')} testID="nutrition-overview" />
        </View>
        <View style={styles.dates}>
          <IconButton
            icon="chevronLeft" variant="ghost" label={copy.previous} disabled={selectedDate <= '0001-01-01'}
            onPress={() => changeDate(shiftDiaryDate(selectedDate, -1))} testID="nutrition-previous"
          />
          <Pressable
            onPress={() => changeDate(today)} accessibilityRole="button"
            accessibilityLabel={`${format.date(selectedDate, today)}. ${copy.returnToday}`}
            style={({ pressed }) => [styles.dateLabel, pressed && { opacity: t.opacity.pressed }]} testID="nutrition-date"
          >
            <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="label" align="center">{format.date(selectedDate, today)}</AppText>
            {selectedDate !== today && (
              <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="caption" tone="primaryText" align="center">{copy.today}</AppText>
            )}
          </Pressable>
          <IconButton
            icon="chevron" variant="ghost" label={copy.next} disabled={selectedDate >= today} testID="nutrition-next"
            onPress={() => { if (selectedDate < today) changeDate(shiftDiaryDate(selectedDate, 1)); }}
          />
        </View>
        {state.status === 'loading' ? (
          <Card>
            <View style={styles.loading} testID="nutrition-loading">
              <ActivityIndicator color={t.colors.primaryText} />
              <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} tone="textSecondary">{copy.loading}</AppText>
            </View>
          </Card>
        ) : state.status === 'error' ? (
          <Card>
            <View style={styles.error} testID="nutrition-error">
              <AppText maxFontSizeMultiplier={t.accessibility.headingTextScale} variant="cardTitle">{copy.unavailable}</AppText>
              <Button maxFontSizeMultiplier={t.accessibility.controlTextScale} label={copy.retry} variant="secondary" testID="nutrition-retry" onPress={() => void refresh()} />
            </View>
          </Card>
        ) : (
          <>
            <NutritionDailySummary view={state.view} copy={copy} number={format.number} />
            <View style={styles.meals}>
              {meals.map(meal => (
                <MealSection
                  key={meal.meal} meal={meal} copy={copy} number={format.number} onEdit={setEditing}
                  onAdd={value => router.push(addFoodRoute(selectedDate, value))}
                />
              ))}
            </View>
          </>
        )}
      </Screen>
      {editing && (
        <NutritionEntryEditor
          key={editing.id} entry={editing} copy={copy} onClose={() => setEditing(null)}
          onSave={async (quantityGrams, meal) => (await nutritionService.updateEntryDetails(editing.localDate, editing.id, { quantityGrams, meal })).ok}
          onDelete={async () => (await nutritionService.deleteEntry(editing.localDate, editing.id)).ok}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: t.spacing.md }, title: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }, flex: { flex: 1 },
  dates: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, marginBottom: t.spacing.none },
  dateLabel: { flex: 1, minHeight: t.size.touchTarget, justifyContent: 'center', gap: t.spacing.xs },
  meals: { gap: t.spacing.md }, loading: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }, error: { gap: t.spacing.lg },
});
