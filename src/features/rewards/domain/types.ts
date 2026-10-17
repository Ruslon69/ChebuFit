declare const orangeBalanceBrand: unique symbol;

/** A nonnegative safe integer, constructed at the domain boundary. */
export type OrangeBalance = number & { readonly [orangeBalanceBrand]: true };
export type LocalCalendarDay = `${number}-${number}-${number}`;
export type CosmeticItemId = string;

type EventContext = Readonly<{
  eventId: string;
  /** ISO timestamp with an explicit offset; retained across retries/edits. */
  occurredAt: string;
  /** User's local day at the original achievement, supplied by the caller. */
  localDay: LocalCalendarDay;
}>;

export type RewardEvent = EventContext & (
  | { readonly type: 'mealLogged'; readonly mealSlotId: string }
  | { readonly type: 'dailyMealsCompleted' | 'waterGoalCompleted' | 'dailyTrackingCompleted' }
  | { readonly type: 'workoutCompleted' | 'weightLogged'; readonly sourceId: string }
  | { readonly type: 'streakMilestone'; readonly streakId: string; readonly milestoneDays: number }
);

export type RewardEventType = RewardEvent['type'];
export type RewardRule = Readonly<{
  eventType: RewardEventType;
  amount: number;
  dailyCap: number | null;
}> & (
  | { readonly eventType: 'streakMilestone'; readonly milestoneDays: number }
  | { readonly eventType: Exclude<RewardEventType, 'streakMilestone'> }
);
export type RewardRules = Readonly<{ [K in RewardEventType]: RewardRule & { readonly eventType: K } }>;

export type RewardGrant = Readonly<{
  grantId: string;
  rewardIdentity: string;
  eventId: string;
  eventType: RewardEventType;
  localDay: LocalCalendarDay;
  amount: number;
  grantedAt: string;
}>;

export type RewardGrantResult =
  | Readonly<{ granted: true; amount: number; newBalance: OrangeBalance; reason: 'granted'; grant: RewardGrant }>
  | Readonly<{
      granted: false;
      amount: 0;
      newBalance: OrangeBalance;
      reason: 'alreadyGranted' | 'dailyCapReached' | 'unsupportedEvent' | 'unsupportedMilestone'
        | 'invalidEvent' | 'invalidRule' | 'invalidHistory' | 'balanceOverflow';
    }>
  | Readonly<{ granted: false; amount: 0; newBalance: null; reason: 'invalidBalance' }>;

/** Future debits are modeled, but no purchase operation or catalog exists. */
export type OrangeLedgerEntry =
  | Readonly<{ kind: 'credit'; grant: RewardGrant }>
  | Readonly<{ kind: 'debit'; entryId: string; amount: number; cosmeticItemId: CosmeticItemId }>;

export type BalanceCalculationResult =
  | Readonly<{ valid: true; balance: OrangeBalance }>
  | Readonly<{
      valid: false;
      reason: 'invalidOpeningBalance' | 'invalidEntry' | 'duplicateEntry' | 'insufficientFunds' | 'balanceOverflow';
    }>;
