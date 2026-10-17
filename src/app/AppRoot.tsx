import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { appConfig } from '../shared/config/app';
import { getMessages } from '../shared/i18n/messages';
import { tokens } from '../shared/theme/tokens';
import { Screen } from '../shared/ui/Screen';

export function AppRoot() {
  const messages = getMessages(appConfig.defaultLocale);

  return (
    <Screen>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          {appConfig.displayName}
        </Text>
        <Text style={styles.description}>{messages.developmentPlaceholder}</Text>
      </View>
      <StatusBar style="dark" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: tokens.spacing.medium,
  },
  title: {
    color: tokens.colors.text,
    fontSize: tokens.typography.title,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    color: tokens.colors.textMuted,
    fontSize: tokens.typography.body,
    textAlign: 'center',
  },
});
