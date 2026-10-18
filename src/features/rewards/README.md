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

Future server persistence must atomically enforce wallet-scoped reward/event/grant identity
uniqueness, daily/weekly caps, welcome/milestone uniqueness, ledger insertion, and
balance update. Retain grants/identity records after source deletion, edits,
reinstall, and retries. Concurrent evaluation alone cannot serialize writes.
Producing features and future authoritative validation must verify actual action
eligibility and preserve original local attribution; client logic is not a server
security boundary. Local persistence is described below.

## Local wallet foundation

`application/OrangeWalletRepository.ts` owns `load`/`save`. Infrastructure implements
it in `src/infrastructure/rewards/KeyValueOrangeWalletRepository.ts`; composition
injects AsyncStorage 2.2.0 through a narrow key-value port. This purpose-built small
key-value store is included in Expo Go for SDK 58. Only a transitive file-system
API existed before; using AsyncStorage avoids implementing a file replacement layer.
See [Expo's SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/sdk/async-storage/).
It is unencrypted local data, not an anti-cheat or credential store.

Schema v1 stores `{ schemaVersion, seed, ledger, createdAt, updatedAt }`. Balance
is replayed from the ledger plus the explicit opening credit; grant entries retain
identities and qualified active-day dates. No separate balance, processed-ID list,
or active-day counter can drift. `decodeOrangeWallet` is the future migration
boundary. Unknown versions, malformed JSON, invalid ledger entries, duplicate IDs,
and invalid balances return typed errors without replacing the stored record.

Development uses key `@chebufit/orange-wallet/developmentDemo`, an explicit seed of
248, and no fabricated grants. Non-development builds use the separate `real` key,
with zero opening credit. Never promote demo state into a real account. The Today
route reads the asynchronous application hook; a pending/unavailable balance is a
dash, not an incorrect zero. Today water-goal transitions are the first integrated reward producer; other feature actions remain unconnected.

`createOrangeWalletService(repository, { now, allowDevelopmentReset? })` exposes
`loadWallet`, `processRewardEvent`, `subscribe`, and `resetForDevelopment`.
All load/evaluate/append/save steps are serialized by repository key across service
instances in one JS runtime. A declined event writes nothing. A successful grant
is published/returned only after one complete-record save. A failed write returns
an error, not a claimed grant; subsequent operations reload storage. Subscriber
errors do not invalidate committed saves.

`resetForDevelopment()` replaces only the demo record with its initial seed and
empty ledger; both the development flag and demo mode are required. Composition
enables it only under `__DEV__`; there is no reset UI. Tests use it after temporary
service-level validation grants. React/UI state and dashboard mock data are not persisted.

This is **single-device, single-JS-process protection**, not a database transaction,
crash-proof multi-write protocol, cross-process lock, cloud sync, or protection from
malicious modification. Always mutate through the shared service. Retained history
will grow: AsyncStorage's native size limits require a migration strategy before
large lifetime histories; do not prune identity/milestone evidence to save space.
Future account/backend storage must enforce the atomic requirements above.

Run `npm run test:wallet` for the repository/application tests,
`npm run test:rewards` for the actual domain tests and
`node scripts/simulate-orange-economy.cjs` for approved-config/math/report checks.
Tests use the existing TypeScript compiler and Node runner; AsyncStorage is the only added direct runtime dependency.

## First producer: Today water goal

The water model emits a fact only when an add crosses from below the
daily goal to or above the goal; mount/relaunch and already-complete amounts emit nothing.
Water quantities and historical goals are persisted by the independent Water
feature (`../water/README.md`); the rewards domain never inspects quantities.
Application composition captures the device-local date and occurrence timestamp
before the add, then forwards a crossing only after water saves successfully.
Reload/read and already-above-goal adds never trigger rewards. The dashboard's
illustrative date is never used for attribution.

`rewardWaterGoalReached` uses a serialized wallet batch in this order:
`waterGoalCompleted` → `activeDayQualified` (`waterTracking`) → `welcomeReward`.
The welcome reference is either an existing useful grant or the new water grant.
All new credits are saved together in one JSON record, then the subscription
publishes one final balance. Normal declines remain zero; storage failure returns
an error without claiming any batch credits. The single-event API uses this same
batch path. Local storage retains its single-runtime limitations described above.

`createOrangeRewardNotice` creates one notice from the committed aggregate only:
fresh demo 248 can earn 2+5+10=17 and become 265; established wallets normally earn
7, or less when some identities already exist. Zero/error produces no notice.
`getRewardFeedbackKind` is a presentation policy, separate from economy rules.
Only newly granted `welcomeReward` or `activeDayMilestone` credits select
`celebration`; all ordinary grants select `micro`, regardless of amount.
`OrangeRewardFeedback` renders one aggregated, nonmodal surface:

- Micro: content-sized amount + orange mark only, no encouragement or mascot;
  220 ms entrance + 1400 ms hold + 180 ms exit = 1.8 seconds.
- Celebration: compact CHEBU-07 card for welcome/milestones;
  260 ms entrance + 2220 ms hold + 220 ms exit = 2.7 seconds.

Both support tap or upward swipe dismissal, using built-in Animated/PanResponder.
Only the surface handles touches; the surrounding layer is `box-none`. Tabs,
quick-add and scrolling remain available. Placement accounts for safe-area insets
and a toolbar-height upper clearance; it never shifts content. Text may grow/wrap
with Dynamic Type. At font scales ≥1.5, celebrations reflow into a small mascot /
amount row followed by full-width title and supporting copy; the mascot is 64 pt.
Micro text scales up to 1.5× and celebration text up to 2× to keep transient
feedback compact even at extreme accessibility settings. Full earned-amount
announcements remain independent of these visual limits. Normal-size celebration
layout/copy is unchanged. Reduced motion removes movement and animation while retaining
the same automatic lifetime. One textual accessibility announcement accompanies
each notice, without a live region, artwork announcement or focus movement.
There is no global popup queue, and feedback never increments wallet state.
Future producers should use the same fact → ordered committed batch → one notice
pattern. No meal/workout/weight UI integration or automatic milestone producer.

Run `npm run test:water-rewards` for the end-to-end application workflow tests.

Run `npm run test:reward-feedback` for presentation classification/aggregation checks.
