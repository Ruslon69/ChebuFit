import { useCallback } from 'react';
import { router } from 'expo-router';

import { useDailyWater } from '../../application/water/useDailyWater';
import { waterDefaults, type LocalDateKey } from '../../features/water';
import { useOrangeWallet } from '../../application/rewards/useOrangeWallet';
import { useWaterGoalRewards } from '../../application/rewards/useWaterGoalRewards';
import { OrangeRewardFeedback } from '../../features/rewards/ui/OrangeRewardFeedback';
import { todayMock } from '../../features/today/model/todayMock';
import { TodayScreen } from '../../features/today/ui/TodayScreen';

export default function TodayRoute() {
  const wallet = useOrangeWallet();
  const { notice, dismiss, onWaterGoalReached } = useWaterGoalRewards();
  const onGoalCrossed = useCallback((fact: { localDate: LocalDateKey; occurredAt: string }) => {
    onWaterGoalReached({ localDay: fact.localDate, occurredAt: fact.occurredAt });
  }, [onWaterGoalReached]);
  const water = useDailyWater(onGoalCrossed);
  return (
    <>
      <TodayScreen
        model={{ ...todayMock, orangeBalance: wallet.balance, water: {
          consumedMl: water.record?.consumedMl ?? null,
          targetMl: water.record?.goalMl ?? null,
          portionMl: waterDefaults.portionMl,
        } }}
        onOpenNutrition={() => router.navigate('/nutrition')}
        onOpenProgress={() => router.navigate('/progress')}
        onOpenDesignSystem={__DEV__ ? () => router.push('/design-system') : undefined}
        onAddWater={() => { void water.addWater(waterDefaults.portionMl); }}
        onRemoveWater={() => { void water.removeWater(waterDefaults.portionMl); }}
      />
      <OrangeRewardFeedback notice={notice} onDismiss={dismiss} />
    </>
  );
}
