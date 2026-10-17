# Orange rewards

Oranges encourage useful, sustainable tracking and fitness engagement, equally
for fat loss, maintenance, and muscle gain. They never reward eating less, calorie
deficits, skipped meals, weight loss, low body weight, or body-fat reduction.
Completion events describe tracking, not a nutritional or body-composition outcome.

## Initial tuning

`domain/rules.ts` is the single configurable rule set. Caps count successful grants
of that event type on the supplied **local calendar day**, not delivery/UTC days.

| Event | Oranges | Daily cap | Logical achievement |
| --- | ---: | ---: | --- |
| `mealLogged` | 2 | 4 | Local day + stable meal slot ID |
| `dailyMealsCompleted` | 5 | 1 | Local day |
| `waterGoalCompleted` | 3 | 1 | Local day |
| `workoutCompleted` | 10 | 1 | Stable workout session ID |
| `weightLogged` | 2 | 1 | Stable weight entry ID |
| `dailyTrackingCompleted` | 5 | 1 | Local day |
| `streakMilestone` | 15 | — | Streak instance ID + 7-day milestone |

`mealSlotId` identifies a stable meal occasion, e.g. `breakfast`, `lunch`, `dinner`,
or `snacks`, rather than an individual food row or a newly generated log ID.
Deleting/recreating food in a slot must reuse that slot. Custom slots can exist,
but only four distinct slots can be rewarded per day. No actual feature integration
or completion/streak qualification logic is implemented here.

## API and identities

Import the public API from `src/features/rewards/index.ts`. The domain is pure
TypeScript with no React, platform APIs, clock reads, randomness, or storage.

```ts
const result = evaluateReward({
  balance: createOrangeBalance(248),
  event: {
    type: 'mealLogged', eventId: 'delivery-1', mealSlotId: 'breakfast',
    occurredAt: '2026-10-17T08:30:00+02:00', localDay: '2026-10-17',
  },
  history: [],
  grantedAt: '2026-10-17T08:30:01+02:00',
  // rules: customRules, // optional; defaults to the central rule set
});
```

The caller supplies the user's local day at the original achievement and retains
it on retries/edits; processing time is separate. Do not recompute it from today's
clock, the device's current timezone, or UTC. Timestamp offsets are explicit;
day/timezone consistency and action eligibility belong to the future producing
feature/application boundary. The engine validates calendar dates and timestamps
without a timezone dependency.

Reward identities are collision-safe JSON tuples:
`["rewards-v1", eventType, ...logicalAchievement]`, using the final column above.
Grant IDs are deterministically `reward:` plus that identity. Changing delivery
`eventId` does not bypass the logical identity; replaying an already granted event
ID is also rejected. Workout/weight source IDs survive edits and recompletions,
even across days. A streak ID denotes one continuous streak instance, not a delivery
or a new ID per milestone attempt. Rule amount tuning does not change identities.
Changing the identity version later requires a migration that retains deduplication.

Supply complete, wallet-scoped successful grant history, including grants for
deleted source records. A successful result contains `amount`, `newBalance`, and
an immutable-shaped `grant` record. Duplicate, capped, unsupported, or invalid
candidates return a non-grant result with zero amount and a reason; they do not
throw. Invalid incoming balance returns `newBalance: null`, never an invalid number.
`createOrangeBalance` is an explicit boundary constructor and throws for invalid
input; evaluation and ledger replay return typed failure results instead.

## Ledger and future persistence

`OrangeBalance` is a branded nonnegative safe integer. `calculateRewardBalance`
replays reward grants; `calculateLedgerBalance` also understands a minimal future
cosmetic debit with an item ID. Both support an explicit opening balance and reject
nonpositive/fractional amounts, duplicate credits/entry IDs, overflow, and overdrafts.
There is no purchasing operation, catalog, ownership, or equipment state.

Evaluation alone does not save a grant or serialize concurrent requests. Future
persistence must atomically check identities and per-day caps, insert the grant/
ledger entry, and update the balance. Enforce wallet-scoped unique reward/event/
grant IDs and retain deduplication records even after source deletion. Transactions
must prevent simultaneous candidates from bypassing caps. Future authoritative
validation must verify qualifying actions and stable source/day/streak identities;
this client domain is not a security boundary. No storage adapter is introduced yet.

Today consumes `model/rewardsMock.ts` through the public API and still displays 248.
It does not evaluate events. Water remains local UI state without reward integration.

Run `npm run test:rewards`: the existing TypeScript compiler builds this pure module
in a temporary directory, Node's built-in runner tests it, and the output is removed.
No test framework or runtime dependency was added.
