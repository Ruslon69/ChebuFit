import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { DailyNutritionView, MealType, NutritionDiaryEntry } from '../domain/types';
import { toNutritionOverview } from '../model/NutritionOverview';
import { calorieGoalStatus, toDiaryMeals } from '../model/diaryPresentation';
import type { NutritionCopy } from '../model/messages';
import { AppText } from '../../../shared/ui/AppText';
import { Card } from '../../../shared/ui/Card';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { Icon } from '../../../shared/ui/Icon';
import { tokens as t } from '../../../shared/theme/tokens';

type CopyProps = { copy: NutritionCopy; number: (value: number, decimals?: number) => string };
export function NutritionDailySummary({ view, copy, number }: CopyProps & { view: DailyNutritionView }) {
  const { fontScale } = useWindowDimensions();
  const overview = toNutritionOverview(view);
  const calorieStatus = calorieGoalStatus(view);
  return (
    <Card>
      <View style={styles.summary} testID="nutrition-summary">
        <View>
          <AppText maxFontSizeMultiplier={t.accessibility.headingTextScale} variant="display" testID="nutrition-calories">{number(overview.calories.consumed)}</AppText>
          <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="bodySecondary" tone="textSecondary">{copy.of} {number(overview.calories.target)} {copy.kcal}</AppText>
        </View>
        <View style={styles.remaining}>
          <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="label" tone="textSecondary">{copy[calorieStatus.kind]}</AppText>
          <AppText maxFontSizeMultiplier={t.accessibility.headingTextScale} variant="sectionTitle">
            {number(calorieStatus.energyCentiKcal / 100, calorieStatus.energyCentiKcal > 0 && calorieStatus.energyCentiKcal < 100 ? 2 : 0)} <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="bodySecondary" tone="textSecondary">{copy.kcal}</AppText>
          </AppText>
        </View>
      </View>
      <View style={styles.macros}>
        {overview.macros.map(macro => (
          <View key={macro.id} style={[styles.macro, fontScale >= 1.5 && { flexBasis: '100%' }]}>
            <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="label" tone="textSecondary">{copy.macros[macro.id]}</AppText>
            <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="label">
              {number(macro.consumed)} <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="caption" tone="textSecondary">/ {number(macro.target)} {copy.grams}</AppText>
            </AppText>
            <ProgressBar
              value={macro.target > 0 ? macro.consumed / macro.target : 0}
              label={`${copy.macros[macro.id]}: ${number(macro.consumed)} / ${number(macro.target)} ${copy.grams}`}
            />
          </View>
        ))}
      </View>
    </Card>
  );
}

export function MealSection({ meal, copy, number, onEdit, onAdd }: CopyProps & {
  meal: ReturnType<typeof toDiaryMeals>[number]; onEdit: (entry: NutritionDiaryEntry) => void; onAdd: (meal: MealType) => void;
}) {
  return (
    <Card padding="none" style={styles.mealCard} testID={`nutrition-meal-${meal.meal}`}>
      <View style={styles.mealHeader}>
        <AppText maxFontSizeMultiplier={t.accessibility.headingTextScale} variant="cardTitle" style={styles.name}>{copy.meals[meal.meal]}</AppText>
        <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="bodySecondary" tone="textSecondary">
          {number(meal.calories)} <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="caption" tone="textSecondary">{copy.kcal}</AppText>
        </AppText>
      </View>
      {meal.entries.length ? meal.entries.map(({ entry, grams, calories }) => (
        <Pressable
          key={entry.id} testID={`nutrition-entry-${entry.id}`} accessibilityRole="button"
          accessibilityLabel={`${entry.food.name}, ${entry.food.brand ? `${entry.food.brand}, ` : ''}${number(grams, 3)} ${copy.grams}, ${number(calories)} ${copy.kcal}`}
          accessibilityHint={copy.editHint} onPress={() => onEdit(entry)}
          style={({ pressed }) => [styles.foodRow, pressed && styles.pressed]}
        >
          <View style={styles.foodCopy}>
            <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{entry.food.name}</AppText>
            <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="bodySecondary" tone="textSecondary">{entry.food.brand ? `${entry.food.brand} · ` : ''}{number(grams, 3)} {copy.grams}</AppText>
          </View>
          <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="label" align="right" style={styles.foodEnergy}>
            {number(calories)} <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="caption" tone="textSecondary">{copy.kcal}</AppText>
          </AppText>
        </Pressable>
      )) : (
        <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="bodySecondary" tone="textSecondary" style={styles.empty}>{copy.emptyMeal}</AppText>
      )}
      <Pressable
        testID={`nutrition-add-${meal.meal}`} accessibilityRole="button" accessibilityLabel={`${copy.addTo}${copy.meals[meal.meal]}`}
        onPress={() => onAdd(meal.meal)} style={({ pressed }) => [styles.add, pressed && styles.pressed]}
      >
        <Icon name="plus" size="small" color={t.colors.primaryText} />
        <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="bodySecondary" tone="primaryText">{copy.add}</AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.lg },
  remaining: { gap: t.spacing.xs }, macros: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.lg, marginTop: t.spacing.xxl },
  macro: { flexGrow: 1, flexBasis: 0, minWidth: t.size.touchTarget + t.spacing.section, gap: t.spacing.sm },
  mealCard: { paddingHorizontal: t.spacing.xl, paddingVertical: t.spacing.md },
  mealHeader: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: t.spacing.sm, marginBottom: t.spacing.xs }, name: { flexGrow: 1 },
  foodRow: { flexDirection: 'row', alignItems: 'baseline', gap: t.spacing.md, paddingVertical: t.spacing.xs, minHeight: t.size.button, borderBottomWidth: t.stroke.thin, borderBottomColor: t.colors.divider },
  foodCopy: { flex: 1, minWidth: 0 }, foodEnergy: { maxWidth: '45%' },
  pressed: { opacity: t.opacity.pressed }, empty: { paddingVertical: t.spacing.sm },
  add: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, minHeight: t.size.touchTarget, paddingVertical: t.spacing.xs },
});
