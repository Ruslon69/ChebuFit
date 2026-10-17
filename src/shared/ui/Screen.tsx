import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { tokens } from '../theme/tokens';

type ScreenProps = PropsWithChildren<{ edges?: Edge[] }>;

export function Screen({ children, edges }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={styles.screen}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.background,
    padding: tokens.spacing.large,
  },
});
