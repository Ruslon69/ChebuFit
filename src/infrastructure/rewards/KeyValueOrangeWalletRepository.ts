import { decodeOrangeWallet, type OrangeWalletMode, type OrangeWalletState, type WalletResult } from '../../features/rewards/application/OrangeWallet';
import type { OrangeWalletRepository } from '../../features/rewards/application/OrangeWalletRepository';

/** AsyncStorage satisfies this narrow port; tests use an in-memory implementation. */
export interface WalletKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export function createKeyValueOrangeWalletRepository(storage: WalletKeyValueStorage, mode: OrangeWalletMode): OrangeWalletRepository {
  // Keep schema version inside the value: a new schema must not silently open a new wallet.
  const identity = `@chebufit/orange-wallet/${mode}`;
  return {
    identity, mode,
    async load(): Promise<WalletResult<OrangeWalletState | null>> {
      let raw: string | null;
      try { raw = await storage.getItem(identity); } catch { return { ok: false, error: 'storageUnavailable' }; }
      if (raw === null) return { ok: true, value: null };
      let data: unknown;
      try { data = JSON.parse(raw); } catch { return { ok: false, error: 'corruptData' }; }
      return decodeOrangeWallet(data, mode);
    },
    async save(state) {
      const decoded = decodeOrangeWallet(state, mode);
      if (!decoded.ok) return decoded;
      try { await storage.setItem(identity, JSON.stringify(decoded.value)); }
      catch { return { ok: false, error: 'storageUnavailable' }; }
      return { ok: true, value: undefined };
    },
  };
}
