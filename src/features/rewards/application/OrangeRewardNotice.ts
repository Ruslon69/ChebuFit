import type { WalletResult } from './OrangeWallet';
import type { RewardBatchResult } from './OrangeWalletService';
import { getRewardFeedbackKind, type RewardFeedbackKind } from './rewardFeedbackPolicy';

export type OrangeRewardNotice = Readonly<{ id: string; amount: number; includesWelcome: boolean; kind: RewardFeedbackKind }>;

/** Only a committed positive batch can become one presentation notice. */
export function createOrangeRewardNotice(batch: WalletResult<RewardBatchResult>, id: string): OrangeRewardNotice | null {
  if (!batch.ok || !Number.isSafeInteger(batch.value.amount) || batch.value.amount <= 0) return null;
  return {
    id, amount: batch.value.amount,
    kind: getRewardFeedbackKind(batch.value.results.flatMap(result => result.granted ? [result.grant] : [])),
    includesWelcome: batch.value.results.some(result => result.granted && result.grant.eventType === 'welcomeReward'),
  };
}
