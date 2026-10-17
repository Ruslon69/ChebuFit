import { router } from 'expo-router';

import { OnboardingScreen } from '../features/onboarding/ui/OnboardingScreen';

export default function OnboardingRoute() {
  return <OnboardingScreen onContinue={() => router.dismissTo('/')} />;
}
