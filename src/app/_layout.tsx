import { RewardFeedbackProvider } from '../application/rewards/RewardFeedbackProvider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useMessages } from '../shared/i18n/useMessages';
import { tokens } from '../shared/theme/tokens';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const messages = useMessages();

  return (
    <RewardFeedbackProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: tokens.colors.background },
          headerTintColor: tokens.colors.text,
          headerTitleStyle: tokens.typography.cardTitle,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: tokens.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{ title: messages.navigation.onboarding }}
        />
        <Stack.Protected guard={__DEV__}>
          <Stack.Screen name="design-system" options={{ title: messages.navigation.designSystem }} />
        </Stack.Protected>
      </Stack>
    </RewardFeedbackProvider>
  );
}
