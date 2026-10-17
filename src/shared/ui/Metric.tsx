import { StyleSheet, View } from 'react-native';

import { tokens } from '../theme/tokens';
import { AppText } from './AppText';

type MetricProps = { label: string; value: string | number; unit?: string; description?: string; accessibilityLabel?: string };

export function Metric({ label, value, unit, description, accessibilityLabel }: MetricProps) {
  return (
    <View accessible accessibilityLabel={accessibilityLabel ?? [label, value, unit, description].filter(part => part !== undefined).join(' ')} style={styles.metric}>
      <AppText variant="label" tone="textSecondary">{label}</AppText>
      <View style={styles.value}>
        <AppText variant="display">{value}</AppText>
        {unit && <AppText variant="bodySecondary" tone="textSecondary">{unit}</AppText>}
      </View>
      {description && <AppText variant="caption" tone="textTertiary">{description}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  metric: { gap: tokens.spacing.xs, minWidth: 0 },
  value: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: tokens.spacing.sm },
});
