import { evaluateReward } from '../domain/engine';
import type { RewardEvent, RewardGrant, RewardGrantResult } from '../domain/types';
import { createInitialWallet, getWalletSnapshot, type OrangeWalletSnapshot, type WalletResult } from './OrangeWallet';
import type { OrangeWalletRepository } from './OrangeWalletRepository';

type Listener = (wallet: OrangeWalletSnapshot) => void;
type Scope = { tail: Promise<void>; listeners: Set<Listener> };
const scopes = new Map<string, Scope>();
function scopeFor(identity: string): Scope {
  let scope = scopes.get(identity);
  if (!scope) { scope = { tail: Promise.resolve(), listeners: new Set() }; scopes.set(identity, scope); }
  return scope;
}

export function createOrangeWalletService(repository: OrangeWalletRepository, options: {
  now: () => string;
  allowDevelopmentReset?: boolean;
}) {
  const scope = scopeFor(repository.identity);
  const serial = <T,>(operation: () => Promise<WalletResult<T>>): Promise<WalletResult<T>> => {
    const task = scope.tail.then(operation).catch((): WalletResult<T> => ({ ok: false, error: 'storageUnavailable' }));
    scope.tail = task.then(() => undefined);
    return task;
  };
  const publish = (wallet: OrangeWalletSnapshot) => {
    for (const listener of scope.listeners) {
      // A consumer error cannot turn a committed write into a failed transaction.
      try { listener(wallet); } catch { /* subscriber isolation */ }
    }
  };
  const read = async () => {
    const loaded = await repository.load();
    if (!loaded.ok) return loaded;
    return { ok: true, value: { state: loaded.value ?? createInitialWallet(repository.mode, options.now()), missing: loaded.value === null } } as const;
  };

  return {
    subscribe(listener: Listener) {
      scope.listeners.add(listener);
      return () => { scope.listeners.delete(listener); };
    },
    loadWallet(): Promise<WalletResult<OrangeWalletSnapshot>> {
      return serial(async () => {
        const loaded = await read();
        if (!loaded.ok) return loaded;
        const snapshot = getWalletSnapshot(loaded.value.state);
        if (!snapshot.ok) return snapshot;
        if (loaded.value.missing) {
          const saved = await repository.save(loaded.value.state);
          if (!saved.ok) return saved;
        }
        publish(snapshot.value);
        return snapshot;
      });
    },
    processRewardEvent(event: RewardEvent): Promise<WalletResult<{ result: RewardGrantResult; wallet: OrangeWalletSnapshot }>> {
      return serial<{ result: RewardGrantResult; wallet: OrangeWalletSnapshot }>(async () => {
        const loaded = await read();
        if (!loaded.ok) return loaded;
        const { state } = loaded.value;
        const snapshot = getWalletSnapshot(state);
        if (!snapshot.ok) return snapshot;
        const history = state.ledger.flatMap(entry => entry.kind === 'credit' ? [entry.grant] : []) satisfies RewardGrant[];
        const now = options.now();
        const result = evaluateReward({ balance: snapshot.value.balance, event, history, grantedAt: now });
        if (!result.granted) return { ok: true, value: { result, wallet: snapshot.value } };
        const updated = {
          ...state, ledger: [...state.ledger, { kind: 'credit', grant: result.grant } as const],
          updatedAt: Date.parse(now) < Date.parse(state.updatedAt) ? state.updatedAt : now,
        };
        const next = getWalletSnapshot(updated);
        if (!next.ok) return next;
        const saved = await repository.save(updated);
        if (!saved.ok) return saved;
        publish(next.value);
        return { ok: true, value: { result, wallet: next.value } };
      });
    },
    resetForDevelopment(): Promise<WalletResult<OrangeWalletSnapshot>> {
      if (!options.allowDevelopmentReset || repository.mode !== 'developmentDemo') return Promise.resolve({ ok: false, error: 'resetDisabled' });
      return serial(async () => {
        const state = createInitialWallet('developmentDemo', options.now());
        const snapshot = getWalletSnapshot(state);
        if (!snapshot.ok) return snapshot;
        const saved = await repository.save(state);
        if (!saved.ok) return saved;
        publish(snapshot.value);
        return snapshot;
      });
    },
  };
}
export type OrangeWalletService = ReturnType<typeof createOrangeWalletService>;
