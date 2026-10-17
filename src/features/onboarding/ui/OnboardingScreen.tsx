import { useMessages } from '../../../shared/i18n/useMessages';
import { Button } from '../../../shared/ui/Button';
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
      <Button label={messages.development.continueToApp} onPress={onContinue} />
    </PlaceholderScreen>
  );
}
