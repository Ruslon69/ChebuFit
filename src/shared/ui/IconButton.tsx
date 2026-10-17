import type { ComponentRef, Ref } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { tokens } from '../theme/tokens';
import { Icon, type IconName } from './Icon';

type IconButtonProps = Omit<PressableProps, 'children' | 'style' | 'accessibilityRole' | 'accessibilityLabel'> & {
  icon: IconName;
  label: string;
  variant?: 'surface' | 'ghost' | 'primary';
  size?: 'standard' | 'large';
  onPress: NonNullable<PressableProps['onPress']>;
  ref?: Ref<ComponentRef<typeof Pressable>>;
};

export function IconButton({ icon, label, variant = 'surface', size = 'standard', disabled = false, accessibilityState, ...props }: IconButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ ...accessibilityState, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        size === 'large' && styles.large,
        { backgroundColor: disabled ? tokens.colors.disabledSurface : variant === 'primary' ? tokens.colors[pressed ? 'primaryPressed' : 'primary'] : pressed ? tokens.colors.primarySubtle : variant === 'surface' ? tokens.colors.surfaceSecondary : undefined },
      ]}
    >
      <Icon name={icon} size={size === 'large' ? 'large' : 'medium'} color={disabled ? tokens.colors.disabledText : variant === 'primary' ? tokens.colors.onPrimary : tokens.colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  large: { minWidth: tokens.size.floatingControl, minHeight: tokens.size.floatingControl },
  button: {
    minWidth: tokens.size.touchTarget,
    minHeight: tokens.size.touchTarget,
    borderRadius: tokens.radii.pill,
    padding: tokens.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
