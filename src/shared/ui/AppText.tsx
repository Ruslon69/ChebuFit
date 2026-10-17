import { Text, type TextProps } from 'react-native';

import { tokens, type TypographyVariant } from '../theme/tokens';

export type TextTone = 'text' | 'textSecondary' | 'textTertiary' | 'primaryText' | 'onPrimary' | 'onDestructive' | 'success' | 'destructive' | 'disabledText';

export type AppTextProps = Omit<TextProps, 'allowFontScaling'> & {
  variant?: TypographyVariant;
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
};

export function AppText({ variant = 'body', tone = 'text', align = 'left', style, accessibilityRole, ...props }: AppTextProps) {
  const heading = variant === 'pageTitle' || variant === 'sectionTitle';
  return (
    <Text
      {...props}
      allowFontScaling
      accessibilityRole={accessibilityRole ?? (heading ? 'header' : undefined)}
      style={[tokens.typography[variant], { color: tokens.colors[tone], textAlign: align, flexShrink: 1 }, style]}
    />
  );
}
