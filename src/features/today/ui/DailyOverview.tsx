import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { tokens } from '../../../shared/theme/tokens';
import { AppText } from '../../../shared/ui/AppText';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Divider } from '../../../shared/ui/Divider';
import { Icon } from '../../../shared/ui/Icon';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { SectionHeader } from '../../../shared/ui/SectionHeader';
import type { TodayViewModel } from '../model/TodayViewModel';
import type { TodayCopy, TodayFormatters } from '../model/messages';

type Presentation = { copy: TodayCopy; format: TodayFormatters };

export function WaterCard({ water, consumedMl, onAdd, copy, format }: Presentation & {
  water: TodayViewModel['water']; consumedMl: number; onAdd: () => void;
}) {
  const complete = consumedMl >= water.targetMl;
  return (
    <Card testID="today-water">
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.waterHeading}>
            <View style={styles.waterIcon}><Icon name="water" color={tokens.colors.success} /></View>
            <AppText variant="cardTitle">{copy.water}</AppText>
          </View>
          <AppText variant="caption" tone={complete ? 'success' : 'textSecondary'} accessibilityLiveRegion="polite">
            {complete ? copy.waterComplete : copy.waterRemaining(format.number((water.targetMl - consumedMl) / 1000))}
          </AppText>
        </View>
        <View style={styles.row}>
          <AppText variant="sectionTitle" testID="today-water-value">{format.number(consumedMl / 1000)} <AppText variant="bodySecondary" tone="textSecondary">/ {format.number(water.targetMl / 1000)} {copy.litres}</AppText></AppText>
          <Button label={copy.waterAdd(water.portionMl)} variant="secondary" disabled={complete} onPress={onAdd} testID="today-water-add" />
        </View>
        <ProgressBar value={consumedMl / water.targetMl} tone="success" label={copy.water} testID="today-water-progress" />
      </View>
    </Card>
  );
}

export function MealsOverview({ meals, onOpen, copy, format }: Presentation & {
  meals: TodayViewModel['meals']; onOpen: () => void;
}) {
  return (
    <View style={styles.content} testID="today-meals">
      <SectionHeader title={copy.nutrition} action={{ label: copy.allMeals, onPress: onOpen }} />
      <Card>
        <View style={styles.meals}>
          {meals.map((meal, index) => (
            <Fragment key={meal.id}>
              {index > 0 && <Divider />}
              <View style={[styles.row, styles.mealRow]} accessible accessibilityLabel={`${copy.meals[meal.id]}, ${format.number(meal.calories)} ${copy.kcal}`}>
                <AppText style={styles.mealName}>{copy.meals[meal.id]}</AppText>
                <View style={styles.mealCalories}>
                  <AppText variant="cardTitle">{format.number(meal.calories)}</AppText>
                  <AppText variant="caption" tone="textSecondary">{copy.kcal}</AppText>
                </View>
              </View>
            </Fragment>
          ))}
        </View>
      </Card>
    </View>
  );
}

export function WorkoutCard({ workout, onStart, copy }: { workout: TodayViewModel['workout']; onStart: () => void; copy: TodayCopy }) {
  return (
    <View style={styles.content} testID="today-workout">
      <SectionHeader title={copy.workout} />
      <Card>
        <View style={styles.content}>
          <View style={styles.workoutHeading}>
            <View style={styles.workoutIcon}><Icon name="workouts" color={tokens.colors.text} /></View>
            <View style={styles.workoutSummary}>
              <AppText variant="sectionTitle">{workout.title}</AppText>
              <AppText variant="bodySecondary" tone="textSecondary">{copy.workoutDetails(workout.exerciseCount, workout.durationMinutes)}</AppText>
            </View>
          </View>
          <Button label={copy.startWorkout} onPress={onStart} testID="today-workout-start" />
        </View>
      </Card>
    </View>
  );
}

export function WeightCard({ weight, onOpen, copy, format }: Presentation & {
  weight: TodayViewModel['weight']; onOpen: () => void;
}) {
  return (
    <Card testID="today-weight">
      <View style={styles.content}>
        <SectionHeader title={copy.weight} action={{ label: copy.history, onPress: onOpen }} />
        <AppText variant="pageTitle">{format.weight(weight.kg)} <AppText variant="body" tone="textSecondary">{copy.kg}</AppText></AppText>
        <View style={styles.weightChange}>
          <Badge label={`${format.change(weight.changeKg)} ${copy.kg}`} tone={weight.changeTone} />
          <AppText variant="bodySecondary" tone="textSecondary">{copy.weightPeriod(weight.periodDays)}</AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: tokens.spacing.lg },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: tokens.spacing.sm },
  waterHeading: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm },
  waterIcon: { padding: tokens.spacing.sm, backgroundColor: tokens.colors.successSubtle, borderRadius: tokens.radii.control },
  meals: { gap: tokens.spacing.none },
  mealRow: { minHeight: tokens.size.touchTarget, paddingVertical: tokens.spacing.sm },
  mealName: { fontWeight: tokens.typography.label.fontWeight },
  mealCalories: { flexDirection: 'row', alignItems: 'baseline', gap: tokens.spacing.xs },
  workoutHeading: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md },
  workoutIcon: { padding: tokens.spacing.md, borderRadius: tokens.radii.control, backgroundColor: tokens.colors.surfaceSecondary },
  workoutSummary: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, gap: tokens.spacing.xs },
  weightChange: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: tokens.spacing.sm },
});
