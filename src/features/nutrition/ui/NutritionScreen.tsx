import { useMessages } from '../../../shared/i18n/useMessages';
import { PlaceholderScreen } from '../../../shared/ui/PlaceholderScreen';

export function NutritionScreen() {
  const messages = useMessages();
  return (
    <PlaceholderScreen
      title={messages.navigation.nutrition}
      subtitle={messages.development.screenSubtitle}
    />
  );
}
