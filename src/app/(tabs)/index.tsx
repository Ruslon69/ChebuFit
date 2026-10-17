import { useMessages } from '../../shared/i18n/useMessages';
import { PlaceholderScreen } from '../../shared/ui/PlaceholderScreen';

export default function TodayRoute() {
  const messages = useMessages();
  return (
    <PlaceholderScreen
      title={messages.navigation.today}
      subtitle={messages.development.screenSubtitle}
    />
  );
}
