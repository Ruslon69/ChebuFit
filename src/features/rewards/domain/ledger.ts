import type { BalanceCalculationResult, OrangeBalance, OrangeLedgerEntry, RewardGrant } from './types';
import { isIdentity, isNonnegativeInteger, isPositiveInteger, isRewardGrant } from './validation';

/** Use only at an explicit boundary; invalid currency is a programming/input error. */
export function createOrangeBalance(value: number): OrangeBalance {
  if (!isNonnegativeInteger(value)) throw new RangeError('Orange balance must be a nonnegative safe integer');
  return value as OrangeBalance;
}

/** Ordered ledger replay; rejects duplicates, invalid amounts, overdrafts, and overflow. */
export function calculateLedgerBalance(entries: readonly OrangeLedgerEntry[], openingBalance = 0): BalanceCalculationResult {
  if (!isNonnegativeInteger(openingBalance)) return { valid: false, reason: 'invalidOpeningBalance' };
  let balance = openingBalance;
  const ids = new Set<string>();
  const rewards = new Set<string>();
  const events = new Set<string>();
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') return { valid: false, reason: 'invalidEntry' };
    let id: string;
    let amount: number;
    if (entry.kind === 'credit') {
      if (!isRewardGrant(entry.grant)) return { valid: false, reason: 'invalidEntry' };
      const grant = entry.grant;
      if (rewards.has(grant.rewardIdentity) || events.has(grant.eventId)) return { valid: false, reason: 'duplicateEntry' };
      rewards.add(grant.rewardIdentity);
      events.add(grant.eventId);
      id = grant.grantId;
      amount = grant.amount;
    } else if (entry.kind === 'debit') {
      if (!isIdentity(entry.entryId) || !isIdentity(entry.cosmeticItemId) || !isPositiveInteger(entry.amount)) return { valid: false, reason: 'invalidEntry' };
      id = entry.entryId;
      amount = -entry.amount;
    } else return { valid: false, reason: 'invalidEntry' };
    if (ids.has(id)) return { valid: false, reason: 'duplicateEntry' };
    ids.add(id);
    balance += amount;
    if (balance < 0) return { valid: false, reason: 'insufficientFunds' };
    if (!isNonnegativeInteger(balance)) return { valid: false, reason: 'balanceOverflow' };
  }
  return { valid: true, balance: createOrangeBalance(balance) };
}

export function calculateRewardBalance(grants: readonly RewardGrant[], openingBalance = 0): BalanceCalculationResult {
  return calculateLedgerBalance(grants.map(grant => ({ kind: 'credit', grant })), openingBalance);
}
