import { Pressable, StyleSheet, Text } from 'react-native';

import { useMessages } from '../../../shared/i18n/useMessages';
import { tokens } from '../../../shared/theme/tokens';
import { PlaceholderScreen } from '../../../shared/ui/PlaceholderScreen';

type OnboardingScreenProps = {
  onContinue: () => void;
};

export function OnboardingScreen({ onContinue }: OnboardingScreenProps) {
  const messages = useMessages();

  return (
    <PlaceholderScreen
      title={messages.navigation.onboarding}
      subtitle={messages.development.onboardingSubtitle}
      edges={['left', 'right', 'bottom']}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onContinue}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.label}>{messages.development.continueToApp}</Text>
      </Pressable>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    justifyContent: 'center',
    padding: tokens.spacing.medium,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  pressed: { backgroundColor: tokens.colors.selectedSurface },
  label: { color: tokens.colors.text, fontSize: tokens.typography.body, textAlign: 'center' },
});
