import { router } from 'expo-router';

import { useOrangeWallet } from '../../application/rewards/useOrangeWallet';
import { useWaterGoalRewards } from '../../application/rewards/useWaterGoalRewards';
import { OrangeRewardFeedback } from '../../features/rewards/ui/OrangeRewardFeedback';
import { todayMock } from '../../features/today/model/todayMock';
import { TodayScreen } from '../../features/today/ui/TodayScreen';

export default function TodayRoute() {
  const wallet = useOrangeWallet();
  const { notice, dismiss, onWaterGoalReached } = useWaterGoalRewards();
  return (
    <>
      <TodayScreen
        model={{ ...todayMock, orangeBalance: wallet.balance }}
        onOpenNutrition={() => router.navigate('/nutrition')}
        onOpenProgress={() => router.navigate('/progress')}
        onOpenDesignSystem={__DEV__ ? () => router.push('/design-system') : undefined}
        onWaterGoalReached={onWaterGoalReached}
      />
      <OrangeRewardFeedback notice={notice} onDismiss={dismiss} />
    </>
  );
}
