import { useCallback } from 'react';

import { createOrangeRewardNotice } from '../../features/rewards';
import type { LocalRewardContext } from './localRewardContext';
import { orangeWalletService } from './orangeWallet';
import { useRewardFeedback } from './RewardFeedbackProvider';
import { rewardWaterGoalReached } from './waterGoalRewards';

export function useWaterGoalRewards() {
  const { show } = useRewardFeedback();
  const onWaterGoalReached = useCallback((context: LocalRewardContext) => {
    void rewardWaterGoalReached(orangeWalletService, context).then(result => {
      if (!result.ok && __DEV__) console.warn('[Orange wallet] Water goal reward was not saved:', result.error);
      const next = createOrangeRewardNotice(result, `water:${context.localDay}`);
      show(next);
    });
  }, [show]);
  return { onWaterGoalReached };
}
