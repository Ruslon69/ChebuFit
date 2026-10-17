declare const orangeBalanceBrand: unique symbol;

/** A nonnegative safe integer, constructed at the domain boundary. */
export type OrangeBalance = number & { readonly [orangeBalanceBrand]: true };
export type LocalCalendarDay = `${number}-${number}-${number}`;
/** Monday date of a caller-supplied local calendar day. */
export type LocalCalendarWeek = LocalCalendarDay;
export type CosmeticItemId = string;
export type ActiveDayCategory = 'foodTracking' | 'waterTracking' | 'completedWorkout';

type EventContext = Readonly<{
  eventId: string;
  /** ISO timestamp with an explicit offset; retained across retries/edits. */
  occurredAt: string;
  /** User's local day at the original achievement, supplied by the caller. */
  localDay: LocalCalendarDay;
  sourceId?: string;
}>;

export type RewardEvent = EventContext & (
  | { readonly type: 'mealLogged' | 'plannedMealsCompleted' | 'waterGoalCompleted' }
  | { readonly type: 'workoutCompleted' | 'weightLogged'; readonly sourceId: string }
  | { readonly type: 'activeDayQualified'; readonly category: ActiveDayCategory; readonly sourceId: string }
  | { readonly type: 'welcomeReward'; readonly qualifyingEventId: string }
  | { readonly type: 'activeDayMilestone'; readonly activeDays: number }
);

export type RewardEventType = RewardEvent['type'];
export type ActiveDayMilestoneRule = Readonly<{ activeDays: number; amount: number }>;
export type RewardRules = Readonly<{
  [K in RewardEventType]: Readonly<{ eventType: K; limit: 1 }> & (
    K extends 'activeDayMilestone'
      ? Readonly<{ period: 'milestone'; milestones: readonly ActiveDayMilestoneRule[] }>
      : Readonly<{
          amount: number;
          period: K extends 'weightLogged' ? 'localWeek' : K extends 'welcomeReward' ? 'lifetime' : 'localDay';
        }>
  )
}>;
export type RewardRule = RewardRules[RewardEventType];

export type RewardGrant = Readonly<{
  grantId: string;
  rewardIdentity: string;
  eventId: string;
  eventType: RewardEventType;
  localDay: LocalCalendarDay;
  localWeek: LocalCalendarWeek;
  sourceId?: string;
  category?: ActiveDayCategory;
  qualifyingEventId?: string;
  activeDays?: number;
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
        | 'weeklyCapReached' | 'notEligible' | 'invalidEvent' | 'invalidRule' | 'invalidHistory' | 'balanceOverflow';
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
