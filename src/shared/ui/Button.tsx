import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { tokens, type ColorRole } from '../theme/tokens';
import { AppText } from './AppText';

const variants = {
  primary: { background: 'primary', pressed: 'primaryPressed', foreground: 'onPrimary' },
  secondary: { background: 'surfaceSecondary', pressed: 'divider', foreground: 'text' },
  ghost: { background: 'background', pressed: 'primarySubtle', foreground: 'primaryText' },
  destructive: { background: 'destructive', pressed: 'destructivePressed', foreground: 'onPrimary' },
} satisfies Record<string, { background: ColorRole; pressed: ColorRole; foreground: ColorRole }>;

export type ButtonProps = Omit<PressableProps, 'children' | 'style' | 'accessibilityRole'> & {
  label: string;
  variant?: keyof typeof variants;
  loading?: boolean;
  onPress: NonNullable<PressableProps['onPress']>;
};

export function Button({ label, variant = 'primary', disabled = false, loading = false, accessibilityLabel, accessibilityState, ...props }: ButtonProps) {
  const unavailable = disabled || loading;
  const colors = variants[variant];
  const foreground = disabled ? 'disabledText' : colors.foreground;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ ...accessibilityState, disabled: unavailable, busy: loading }}
      disabled={unavailable}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: disabled ? tokens.colors.disabledSurface : variant === 'ghost' && !pressed ? undefined : tokens.colors[pressed ? colors.pressed : colors.background] },
      ]}
    >
      <View style={styles.content} pointerEvents="none">
        {loading && <ActivityIndicator color={tokens.colors[foreground]} accessible={false} />}
        <AppText variant="button" tone={foreground} align="center" accessible={false}>{label}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: tokens.size.button,
    minWidth: tokens.size.touchTarget,
    borderRadius: tokens.radii.control,
    justifyContent: 'center',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
  },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing.sm },
});
