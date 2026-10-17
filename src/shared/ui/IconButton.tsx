import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { tokens } from '../theme/tokens';
import { Icon, type IconName } from './Icon';

type IconButtonProps = Omit<PressableProps, 'children' | 'style' | 'accessibilityRole' | 'accessibilityLabel'> & {
  icon: IconName;
  label: string;
  variant?: 'surface' | 'ghost';
  onPress: NonNullable<PressableProps['onPress']>;
};

export function IconButton({ icon, label, variant = 'surface', disabled = false, accessibilityState, ...props }: IconButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ ...accessibilityState, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: disabled ? tokens.colors.disabledSurface : pressed ? tokens.colors.primarySubtle : variant === 'surface' ? tokens.colors.surfaceSecondary : undefined },
      ]}
    >
      <Icon name={icon} color={disabled ? tokens.colors.disabledText : tokens.colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: tokens.size.touchTarget,
    minHeight: tokens.size.touchTarget,
    borderRadius: tokens.radii.pill,
    padding: tokens.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
