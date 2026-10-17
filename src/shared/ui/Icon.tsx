import type { ComponentProps } from 'react';
import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { tokens } from '../theme/tokens';

const symbols = {
  home: { ios: 'house', android: 'home', web: 'home' },
  nutrition: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
  workouts: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
  progress: { ios: 'chart.xyaxis.line', android: 'trending_up', web: 'trending_up' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  check: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  palette: { ios: 'paintpalette', android: 'palette', web: 'palette' },
} satisfies Record<string, ComponentProps<typeof SymbolView>['name']>;

export type IconName = keyof typeof symbols;
type IconProps = { name: IconName; size?: 'small' | 'medium' | 'large'; color?: ColorValue };
const sizes = { small: tokens.size.iconSmall, medium: tokens.size.icon, large: tokens.size.iconLarge };

// Decorative: the parent control or adjacent text supplies the accessible label.
export function Icon({ name, size = 'medium', color = tokens.colors.textSecondary }: IconProps) {
  return (
    <SymbolView
      name={symbols[name]}
      size={sizes[size]}
      tintColor={color}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
