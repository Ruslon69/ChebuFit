import { calculateLedgerBalance } from '../domain/ledger';
import type { OrangeBalance, OrangeLedgerEntry } from '../domain/types';
import { isNonnegativeInteger, isTimestamp } from '../domain/validation';
import { rewardsMock } from '../model/rewardsMock';

export type OrangeWalletMode = 'developmentDemo' | 'real';
export type OrangeWalletState = Readonly<{
  schemaVersion: 1;
  /** Explicit opening credit, never represented as earned reward grants. */
  seed: Readonly<{ kind: 'developmentDemo'; amount: OrangeBalance }> | Readonly<{ kind: 'none'; amount: 0 }>;
  ledger: readonly OrangeLedgerEntry[];
  createdAt: string;
  updatedAt: string;
}>;
export type OrangeWalletError = 'corruptData' | 'unsupportedSchema' | 'storageUnavailable' | 'resetDisabled';
export type WalletResult<T> = Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; error: OrangeWalletError }>;
export type OrangeWalletSnapshot = Readonly<{ state: OrangeWalletState; balance: OrangeBalance }>;

export function createInitialWallet(mode: OrangeWalletMode, now: string): OrangeWalletState {
  return {
    schemaVersion: 1,
    seed: mode === 'developmentDemo' ? { kind: 'developmentDemo', amount: rewardsMock.orangeBalance } : { kind: 'none', amount: 0 },
    ledger: [], createdAt: now, updatedAt: now,
  };
}

export function getWalletSnapshot(state: OrangeWalletState): WalletResult<OrangeWalletSnapshot> {
  const result = calculateLedgerBalance(state.ledger, state.seed.amount);
  return result.valid ? { ok: true, value: { state, balance: result.balance } } : { ok: false, error: 'corruptData' };
}

const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Version dispatch boundary. Never repair/overwrite unsupported or corrupt records. */
export function decodeOrangeWallet(value: unknown, mode: OrangeWalletMode): WalletResult<OrangeWalletState> {
  const corrupt = { ok: false, error: 'corruptData' } as const;
  if (!record(value) || !Number.isSafeInteger(value.schemaVersion)) return corrupt;
  if (value.schemaVersion !== 1) return { ok: false, error: 'unsupportedSchema' };
  if (!record(value.seed) || typeof value.seed.amount !== 'number' || !isNonnegativeInteger(value.seed.amount)
    || (mode === 'developmentDemo' ? value.seed.kind !== 'developmentDemo' : value.seed.kind !== 'none' || value.seed.amount !== 0)
    || !Array.isArray(value.ledger) || !isTimestamp(value.createdAt) || !isTimestamp(value.updatedAt)
    || Date.parse(value.updatedAt) < Date.parse(value.createdAt)) return corrupt;
  // The domain replay validates every credit/debit, integer, duplicate ID and balance.
  const replay = calculateLedgerBalance(value.ledger as OrangeLedgerEntry[], value.seed.amount);
  if (!replay.valid) return corrupt;
  return {
    ok: true,
    value: {
      schemaVersion: 1,
      seed: mode === 'developmentDemo' ? { kind: 'developmentDemo', amount: value.seed.amount as OrangeBalance } : { kind: 'none', amount: 0 },
      ledger: value.ledger as OrangeLedgerEntry[], createdAt: value.createdAt, updatedAt: value.updatedAt,
    },
  };
}
