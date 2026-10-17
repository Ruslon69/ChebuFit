import { createOrangeBalance } from '../domain/ledger';

/** Presentation fixture only; no grants are executed or persisted. */
export const rewardsMock = { orangeBalance: createOrangeBalance(248) } as const;
