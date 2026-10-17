import type { WalletResult } from './OrangeWallet';
import type { RewardBatchResult } from './OrangeWalletService';

export type OrangeRewardNotice = Readonly<{ id: string; amount: number; includesWelcome: boolean }>;

/** Only a committed positive batch can become one presentation notice. */
export function createOrangeRewardNotice(batch: WalletResult<RewardBatchResult>, id: string): OrangeRewardNotice | null {
  if (!batch.ok || !Number.isSafeInteger(batch.value.amount) || batch.value.amount <= 0) return null;
  return {
    id, amount: batch.value.amount,
    includesWelcome: batch.value.results.some(result => result.granted && result.grant.eventType === 'welcomeReward'),
  };
}
