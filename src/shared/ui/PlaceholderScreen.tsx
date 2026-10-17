import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';

import { tokens } from '../theme/tokens';
import { Screen } from './Screen';
import { AppText } from './AppText';

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
        <AppText variant="pageTitle" align="center">{title}</AppText>
        <AppText tone="textSecondary" align="center">{subtitle}</AppText>
        {children}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: tokens.spacing.md },
});
