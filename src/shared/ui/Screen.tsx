import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { tokens } from '../theme/tokens';

type ScreenProps = PropsWithChildren<{
  edges?: Edge[];
  scroll?: boolean;
  keyboardAware?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}>;

export function Screen({ children, edges, scroll = false, keyboardAware = false, contentContainerStyle, testID }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={styles.screen} testID={testID}>
      {scroll ? (
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustKeyboardInsets={keyboardAware}
          keyboardDismissMode={keyboardAware ? 'interactive' : 'none'}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, contentContainerStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: tokens.layout.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: tokens.spacing.page,
    paddingTop: tokens.spacing.xxl,
    paddingBottom: tokens.spacing.section,
  },
  fill: { flex: 1 },
});
