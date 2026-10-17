# Orange rewards — approved economy v1

Oranges reward useful tracking, not eating less, calorie deficits, weight loss,
low body weight, skipped meals, or body-fat reduction. Currency never expires;
inactivity never debits it or resets active-day progress. Cosmetics offer no
fitness/gameplay advantage. Every user has a complete free default outfit.
See [the approved economy](../../../docs/ORANGE_ECONOMY_V1.md) for pricing guidance,
projections, and product principles. There is no store or wardrobe state.

## Rules and public API

`domain/rules.ts` centralizes runtime values. The approved JSON in `docs/` is a
validated documentation snapshot, not a runtime import. Import contracts and
functions through `src/features/rewards/index.ts`.

| Event | Oranges | Once per |
| --- | ---: | --- |
| `mealLogged` | 2 | Local day, regardless of meal/source |
| `plannedMealsCompleted` | 1 | Local day |
| `waterGoalCompleted` | 2 | Local day |
| `workoutCompleted` | 3 | Local day, regardless of session |
| `weightLogged` | 1 | Local Monday–Sunday week |
| `activeDayQualified` | 5 | Local day, regardless of qualifying category |
| `welcomeReward` | 10 | Account lifetime |
| `activeDayMilestone` | 10/20/35/50/75 | Lifetime threshold 7/30/90/180/365 |

The producer owns action qualification. An active-day event supplies one approved
category (`foodTracking`, `waterTracking`, `completedWorkout`) and source ID.
There is no all-categories checklist. Weight alone does not qualify; the evaluator
never emits secondary events. Planned-meal completion means logging the user's
planned meal occasions, without a fixed count or calorie/intake condition.

```ts
const result = evaluateReward({
  balance: createOrangeBalance(248),
  event: {
    type: 'mealLogged', eventId: 'delivery-1', sourceId: 'food-entry-1',
    occurredAt: '2026-10-17T08:30:00+02:00', localDay: '2026-10-17',
  },
  history: [],
  grantedAt: '2026-10-17T08:30:01+02:00',
});
```

Welcome references an existing useful tracking grant using `qualifyingEventId`.
Meal, planned meals, water, workout, weight, or qualified active-day grants can
establish eligibility. Opening the app/onboarding cannot; neither can welcome or
milestone grants. Weight may unlock welcome without creating an active day.

Milestone candidates specify `activeDays`; eligibility is checked against the
number of unique local dates of retained `activeDayQualified` grants. Dates need
not be consecutive. Thresholds may be processed after a gap or out of order, but
never twice. Additional thresholds belong in central rules. Old provisional event
names are unsupported; no migration aliases are needed without persisted grants.

## Calendar and idempotency

The caller supplies the original local date, retaining it on retries/edits.
The domain does not infer timezone/day from the event UTC timestamp. Timestamps
must carry an explicit offset. `getLocalWeekStart` returns the Monday date via
pure date-only arithmetic, unaffected by host timezone/DST. For example,
2026-12-31 and 2027-01-03 share week key 2026-12-28; 2027-01-04 starts another.

Collision-safe identities are JSON tuples `["rewards-v1", eventType, ...key]`:
local date for daily rewards, Monday date for weight, no additional key for welcome,
and threshold number for milestones. IDs are scoped to one account/wallet by
history/persistence. `grantId` is deterministically `reward:` plus the identity.
Delivery event IDs are also deduplicated. Workout and weight source IDs survive
edits and cannot be relabeled to earn again in a later period. A newly created
source within the same day/week still shares the product identity and earns nothing.

Pass complete retained successful grant history for one wallet. Successful results
contain amount, new balance, and a grant with original day/week and trace fields.
Normal duplicates, caps, ineligible/invalid events return zero with a typed reason.
An invalid incoming balance returns `newBalance: null`. The explicit boundary
constructor `createOrangeBalance` throws for invalid currency input; evaluation
and ledger replay return typed results instead. There are no clock/random calls,
React imports, feature imports, I/O, or automatic event emission in the domain.

## Ledger and future persistence

Balances and entry amounts are safe integers. Pure ledger replay rejects fractional,
negative/zero amounts, duplicate IDs/credits, overflow, and overdrafts. Minimal
future cosmetic debit types exist; there is no purchase operation or catalog.

Future persistence must atomically enforce wallet-scoped reward/event/grant identity
uniqueness, daily/weekly caps, welcome/milestone uniqueness, ledger insertion, and
balance update. Retain grants/identity records after source deletion, edits,
reinstall, and retries. Concurrent evaluation alone cannot serialize writes.
Producing features and future authoritative validation must verify actual action
eligibility and preserve original local attribution; client logic is not a server
security boundary. No storage adapter is implemented here.

Today still imports `rewardsMock.orangeBalance` (248); no UI action executes rewards.
Run `npm run test:rewards` for the actual domain tests and
`node scripts/simulate-orange-economy.cjs` for approved-config/math/report checks.
Both use existing tooling; no new packages were added.
