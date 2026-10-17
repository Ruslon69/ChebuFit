import { StyleSheet, View } from 'react-native';

import { tokens } from '../theme/tokens';
import { AppText } from './AppText';

const tones = {
  neutral: { background: 'surfaceSecondary', text: 'textSecondary' },
  positive: { background: 'successSubtle', text: 'success' },
  accent: { background: 'primarySubtle', text: 'primaryText' },
} as const;

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: keyof typeof tones }) {
  const colors = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: tokens.colors[colors.background] }]}>
      <AppText variant="label" tone={colors.text}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: tokens.radii.pill, paddingVertical: tokens.spacing.xs, paddingHorizontal: tokens.spacing.md, maxWidth: '100%' },
});
