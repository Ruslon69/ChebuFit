import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { tokens } from '../theme/tokens';

export function Screen({ children }: PropsWithChildren) {
  return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.background,
    padding: tokens.spacing.large,
  },
});
