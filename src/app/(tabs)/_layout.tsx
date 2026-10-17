import { Tabs } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMessages } from '../../shared/i18n/useMessages';
import { tokens } from '../../shared/theme/tokens';

export default function MainTabsLayout() {
  const { navigation } = useMessages();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: tokens.colors.background },
        headerTintColor: tokens.colors.text,
        tabBarActiveTintColor: tokens.colors.text,
        tabBarInactiveTintColor: tokens.colors.textMuted,
        tabBarActiveBackgroundColor: tokens.colors.selectedSurface,
        tabBarStyle: {
          backgroundColor: tokens.colors.background,
          borderTopColor: tokens.colors.border,
          // Preserve asymmetric device insets without padding both sides by the larger inset.
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        tabBarLabelPosition: 'beside-icon',
        tabBarIcon: () => null,
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: {
          fontSize: tokens.typography.tabLabel,
          fontWeight: '600',
          marginStart: 0,
          marginEnd: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: navigation.today, tabBarButtonTestID: 'tab-today' }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{ title: navigation.nutrition, tabBarButtonTestID: 'tab-nutrition' }}
      />
      <Tabs.Screen
        name="workouts"
        options={{ title: navigation.workouts, tabBarButtonTestID: 'tab-workouts' }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: navigation.progress, tabBarButtonTestID: 'tab-progress' }}
      />
    </Tabs>
  );
}
