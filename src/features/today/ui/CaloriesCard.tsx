import { StyleSheet, View } from 'react-native';

import { tokens } from '../../../shared/theme/tokens';
import { AppText } from '../../../shared/ui/AppText';
import { Card } from '../../../shared/ui/Card';
import { Divider } from '../../../shared/ui/Divider';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import type { TodayViewModel } from '../model/TodayViewModel';
import type { TodayCopy, TodayFormatters } from '../model/messages';

type Props = Pick<TodayViewModel, 'calories' | 'macros'> & { copy: TodayCopy; format: TodayFormatters };

export function CaloriesCard({ calories, macros, copy, format }: Props) {
  const remaining = Math.max(0, calories.target - calories.consumed);

  return (
    <Card padding="spacious" testID="today-calories">
      <View style={styles.content}>
        <View style={styles.heading}>
          <AppText variant="cardTitle">{copy.calories}</AppText>
          <AppText variant="caption" tone="textSecondary">{copy.target} {format.number(calories.target)} {copy.kcal}</AppText>
        </View>
        <View style={styles.balance}>
          <View style={styles.consumed} accessible accessibilityLabel={`${format.number(calories.consumed)} ${copy.consumed}`}>
            <AppText variant="display">{format.number(calories.consumed)}</AppText>
            <AppText variant="bodySecondary" tone="textSecondary">{copy.consumed}</AppText>
          </View>
          <View style={styles.remaining} accessible accessibilityLabel={`${copy.remaining} ${format.number(remaining)} ${copy.kcal}`}>
            <AppText variant="caption" tone="textSecondary">{copy.remaining}</AppText>
            <AppText variant="sectionTitle" tone="primaryText">{format.number(remaining)}</AppText>
            <AppText variant="caption" tone="textSecondary">{copy.kcal}</AppText>
          </View>
        </View>
        <ProgressBar value={calories.consumed / calories.target} label={copy.calories} testID="today-calorie-progress" />
        <Divider />
        <View style={styles.macros}>
          {macros.map(macro => (
            <View key={macro.id} style={styles.macro} testID={`today-macro-${macro.id}`}>
              <AppText variant="bodySecondary" tone="textSecondary">{copy.macros[macro.id]}</AppText>
              <View accessible accessibilityLabel={`${copy.macros[macro.id]} ${format.number(macro.consumed)} / ${format.number(macro.target)} ${copy.grams}`}>
                <AppText variant="cardTitle">{format.number(macro.consumed)} <AppText variant="caption" tone="textSecondary">{copy.grams}</AppText></AppText>
                <AppText variant="caption" tone="textTertiary">/ {format.number(macro.target)} {copy.grams}</AppText>
              </View>
              <ProgressBar value={macro.consumed / macro.target} label={copy.macros[macro.id]} />
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: tokens.spacing.lg },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacing.sm },
  balance: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacing.lg },
  consumed: { gap: tokens.spacing.xs, flexShrink: 1 },
  remaining: { alignItems: 'flex-end', gap: tokens.spacing.xs },
  macros: { flexDirection: 'row', gap: tokens.spacing.md },
  macro: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, gap: tokens.spacing.sm },
});
