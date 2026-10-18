import { useCallback, useEffect, useRef, useState } from 'react';

import { createOrangeRewardNotice, type OrangeRewardNotice } from '../../features/rewards';
import type { LocalRewardContext } from './localRewardContext';
import { orangeWalletService } from './orangeWallet';
import { rewardWaterGoalReached } from './waterGoalRewards';

export function useWaterGoalRewards() {
  const [notice, setNotice] = useState<OrangeRewardNotice | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const dismiss = useCallback((id: string) => setNotice(current => current?.id === id ? null : current), []);
  const onWaterGoalReached = useCallback((context: LocalRewardContext) => {
    void rewardWaterGoalReached(orangeWalletService, context).then(result => {
      if (!result.ok && __DEV__) console.warn('[Orange wallet] Water goal reward was not saved:', result.error);
      const next = createOrangeRewardNotice(result, `water:${context.localDay}`);
      if (mounted.current && next) setNotice(next);
    });
  }, []);
  return { notice, dismiss, onWaterGoalReached };
}
