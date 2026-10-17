import { router } from 'expo-router';

import { useOrangeWallet } from '../../application/rewards/useOrangeWallet';
import { todayMock } from '../../features/today/model/todayMock';
import { TodayScreen } from '../../features/today/ui/TodayScreen';

export default function TodayRoute() {
  const wallet = useOrangeWallet();
  return (
    <TodayScreen
      model={{ ...todayMock, orangeBalance: wallet.balance }}
      onOpenNutrition={() => router.navigate('/nutrition')}
      onOpenProgress={() => router.navigate('/progress')}
      onOpenDesignSystem={__DEV__ ? () => router.push('/design-system') : undefined}
    />
  );
}
