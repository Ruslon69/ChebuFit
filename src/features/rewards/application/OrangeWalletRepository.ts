import type { OrangeWalletMode, OrangeWalletState, WalletResult } from './OrangeWallet';

/** Owned by rewards; concrete storage and JSON handling stay in infrastructure. */
export interface OrangeWalletRepository {
  /** Same physical storage key must use the same queue identity in one JS process. */
  readonly identity: string;
  readonly mode: OrangeWalletMode;
  load(): Promise<WalletResult<OrangeWalletState | null>>;
  save(state: OrangeWalletState): Promise<WalletResult<undefined>>;
}
