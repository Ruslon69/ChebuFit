import { evaluateReward } from '../domain/engine';
import type { RewardEvent, RewardGrant, RewardGrantResult } from '../domain/types';
import { createInitialWallet, getWalletSnapshot, type OrangeWalletSnapshot, type WalletResult } from './OrangeWallet';
import type { OrangeWalletRepository } from './OrangeWalletRepository';

export type RewardBatchResult = Readonly<{
  results: readonly RewardGrantResult[];
  amount: number;
  wallet: OrangeWalletSnapshot;
}>;
type RewardBatchInput = readonly RewardEvent[] | ((wallet: OrangeWalletSnapshot) => readonly RewardEvent[]);

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

  const processRewardEvents = (input: RewardBatchInput): Promise<WalletResult<RewardBatchResult>> => serial(async () => {
    const loaded = await read();
    if (!loaded.ok) return loaded;
    const { state } = loaded.value;
    const initial = getWalletSnapshot(state);
    if (!initial.ok) return initial;
    const events = typeof input === 'function' ? input(initial.value) : input;
    const history = state.ledger.flatMap(entry => entry.kind === 'credit' ? [entry.grant] : []) satisfies RewardGrant[];
    const results: RewardGrantResult[] = [];
    const credits: RewardGrant[] = [];
    const now = options.now();
    let balance = initial.value.balance;
    for (const event of events) {
      const result = evaluateReward({ balance, event, history, grantedAt: now });
      results.push(result);
      if (result.granted) { credits.push(result.grant); history.push(result.grant); balance = result.newBalance; }
    }
    if (!credits.length) return { ok: true, value: { results, amount: 0, wallet: initial.value } };
    const updated = {
      ...state, ledger: [...state.ledger, ...credits.map(grant => ({ kind: 'credit', grant } as const))],
      updatedAt: Date.parse(now) < Date.parse(state.updatedAt) ? state.updatedAt : now,
    };
    const next = getWalletSnapshot(updated);
    if (!next.ok) return next;
    const saved = await repository.save(updated);
    if (!saved.ok) return saved;
    publish(next.value);
    return { ok: true, value: { results, amount: credits.reduce((sum, grant) => sum + grant.amount, 0), wallet: next.value } };
  });

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
    processRewardEvents,
    async processRewardEvent(event: RewardEvent): Promise<WalletResult<{ result: RewardGrantResult; wallet: OrangeWalletSnapshot }>> {
      const batch = await processRewardEvents([event]);
      return batch.ok ? { ok: true, value: { result: batch.value.results[0], wallet: batch.value.wallet } } : batch;
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
