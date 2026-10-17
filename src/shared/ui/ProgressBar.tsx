import { StyleSheet, View } from 'react-native';

import { tokens } from '../theme/tokens';

export function clampProgress(value: number): number {
  return Number.isNaN(value) ? 0 : Math.max(0, Math.min(1, value));
}

type ProgressBarProps = { value: number; label: string; tone?: 'primary' | 'success'; testID?: string };

export function ProgressBar({ value, label, tone = 'primary', testID }: ProgressBarProps) {
  const progress = clampProgress(value);
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: tokens.colors[tone] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: tokens.size.progress, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.surfaceSecondary, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: tokens.radii.pill },
});
