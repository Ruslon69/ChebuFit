import { useMessages } from '../../../shared/i18n/useMessages';
import { PlaceholderScreen } from '../../../shared/ui/PlaceholderScreen';

export function WorkoutsScreen() {
  const messages = useMessages();
  return (
    <PlaceholderScreen
      title={messages.navigation.workouts}
      subtitle={messages.development.screenSubtitle}
    />
  );
}
