import { useMessages } from '../../../shared/i18n/useMessages';
import { PlaceholderScreen } from '../../../shared/ui/PlaceholderScreen';

export function ProgressScreen() {
  const messages = useMessages();
  return (
    <PlaceholderScreen
      title={messages.navigation.progress}
      subtitle={messages.development.screenSubtitle}
    />
  );
}
