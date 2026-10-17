import { Tabs } from 'expo-router/js-tabs';
import { View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMessages } from '../../shared/i18n/useMessages';
import { tokens } from '../../shared/theme/tokens';
import { AppText } from '../../shared/ui/AppText';
import { Icon } from '../../shared/ui/Icon';
import { QuickAdd } from '../../application/quick-add/QuickAdd';

export default function MainTabsLayout() {
  const { navigation } = useMessages();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const tabBarHeight = Math.max(tokens.size.tabBar, tokens.size.iconLarge + tokens.typography.caption.lineHeight * fontScale + tokens.spacing.md) + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: tokens.colors.background }}>
      <Tabs
        screenOptions={{
          // Reserve a small action lane so the floating control never covers content.
          sceneStyle: { backgroundColor: tokens.colors.background, paddingBottom: tokens.size.floatingControl + tokens.spacing.lg },
          headerStyle: { backgroundColor: tokens.colors.background },
          headerTintColor: tokens.colors.text,
          headerTitleStyle: tokens.typography.cardTitle,
          headerShadowVisible: false,
          tabBarActiveTintColor: tokens.colors.primaryText,
          tabBarInactiveTintColor: tokens.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: tokens.colors.surface,
            borderTopColor: tokens.colors.divider,
            height: tabBarHeight,
            // Preserve asymmetric device insets without padding both sides by the larger inset.
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
          tabBarLabelPosition: 'below-icon',
          tabBarLabel: ({ children, focused }) => (
            <AppText
              variant="caption"
              tone={focused ? 'primaryText' : 'textSecondary'}
              align="center"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              style={{
                fontWeight: focused ? tokens.typography.label.fontWeight : tokens.typography.caption.fontWeight,
                flexShrink: 0,
                minHeight: tokens.typography.caption.lineHeight * fontScale,
              }}
            >
              {children}
            </AppText>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: navigation.today,
            headerShown: false,
            tabBarButtonTestID: 'tab-today',
            tabBarAccessibilityLabel: navigation.today,
            tabBarIcon: ({ color }) => <Icon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{ title: navigation.nutrition, tabBarButtonTestID: 'tab-nutrition', tabBarAccessibilityLabel: navigation.nutrition, tabBarIcon: ({ color }) => <Icon name="nutrition" color={color} /> }}
        />
        <Tabs.Screen
          name="workouts"
          options={{ title: navigation.workouts, tabBarButtonTestID: 'tab-workouts', tabBarAccessibilityLabel: navigation.workouts, tabBarIcon: ({ color }) => <Icon name="workouts" color={color} /> }}
        />
        <Tabs.Screen
          name="progress"
          options={{ title: navigation.progress, tabBarButtonTestID: 'tab-progress', tabBarAccessibilityLabel: navigation.progress, tabBarIcon: ({ color }) => <Icon name="progress" color={color} /> }}
        />
      </Tabs>
      <QuickAdd tabBarHeight={tabBarHeight} />
    </View>
  );
}
