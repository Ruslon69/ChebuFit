import { View, StyleSheet, type ViewProps } from 'react-native';

import { tokens } from '../theme/tokens';

const paddingValues = {
  none: tokens.spacing.none,
  compact: tokens.spacing.md,
  standard: tokens.spacing.xl,
  spacious: tokens.spacing.xxl,
};

type CardProps = ViewProps & { padding?: keyof typeof paddingValues; elevated?: boolean };

export function Card({ padding = 'standard', elevated = true, style, ...props }: CardProps) {
  return <View {...props} style={[styles.card, elevated && tokens.elevation.card, { padding: paddingValues[padding] }, style]} />;
}

const styles = StyleSheet.create({
  card: { backgroundColor: tokens.colors.surface, borderRadius: tokens.radii.card },
});
