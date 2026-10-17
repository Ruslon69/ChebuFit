import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';

import { tokens } from '../theme/tokens';
import { Screen } from './Screen';

type PlaceholderScreenProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  edges?: Edge[];
}>;

export function PlaceholderScreen({
  title,
  subtitle,
  children,
  edges = ['left', 'right'],
}: PlaceholderScreenProps) {
  return (
    <Screen edges={edges}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: tokens.spacing.medium },
  title: {
    color: tokens.colors.text,
    fontSize: tokens.typography.title,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.body,
    textAlign: 'center',
  },
});
