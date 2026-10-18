# Daily water foundation

`domain/` owns React-independent integer milliliters (`WaterAmountMl`,
`WaterGoalMl`), `DailyWaterRecord`, validation and pure add/remove transitions.
Liters and localized decimals are presentation only. Amounts may exceed the goal;
only the shared progress bar clamps its visual ratio to 100%. Corrections clamp
at zero. Zero/negative/fractional/unsafe additions and invalid goals are rejected.

`application/` owns `WaterRepository`, `WaterService`, and the schema/migration
boundary. Schema v1 is `{ schemaVersion: 1, mode, defaultGoalMl, demoSeed,
dailyRecords }`; each record stores `{ localDate, consumedMl, goalMl, createdAt,
updatedAt }`. The record's goal is a historical snapshot. `setDefaultGoal` changes
only future record creation, never existing days. `getHistory(from, through)`
returns stored records in inclusive date order without filling missing days.

Composition in `src/application/water/` injects existing AsyncStorage through
`src/infrastructure/water/KeyValueWaterRepository.ts`. Mode-specific keys are
`@chebufit/water/real` and `@chebufit/water/developmentDemo`. Unknown schemas,
corrupt JSON, duplicate dates, invalid units/goals/metadata fail with typed errors;
stored data is preserved, not reset. Schema version stays inside the value so a
new version cannot silently open an empty namespace.

Real days begin at 0 ml with default goal 2500 ml. Development has a **one-time
1500 ml demo opening**, explicitly recorded in `demoSeed` for the first requested
date (normally today's initial read), without fabricated history. Subsequent
new days start at zero. Demo data never migrates into real mode. Code-only
`resetForDevelopment(localDate)` restores this initial demo day and clears demo
history; it is disabled for real mode and non-development composition.

## API and local days

- `getDay(localDate)` lazily creates/persists a day if needed.
- `addWater(amountMl, localDate)` / `removeWater(amountMl, localDate)` persist
  before returning `{ record, crossedGoal }` or a typed error.
- `getDefaultGoal()` / `setDefaultGoal(goalMl)` own the current default.
- `getHistory(from, through)` supports future day/week views.
- `subscribe(listener)` publishes committed/read daily records only.

Callers explicitly supply a validated local calendar date, using shared local
calendar utilities for device-local capture. The service never derives dates
from UTC timestamps. New dates start separate records, including at year/DST
boundaries. Today refreshes on focus, foreground, and add; no midnight timer.

All load/modify/save operations share a serialized queue by repository identity
across service instances in one JS process, preventing lost local adds. This is
not a cross-process/device transaction or anti-cheat boundary. The whole versioned
JSON record is adequate for MVP; growing history will eventually need migration.
A future Watch adapter can call `addWater(250, localDate)` without Today/React.
Reliable sync will additionally need stable operation IDs, delivery deduplication,
and an authoritative merge/transaction strategy; none is implemented here.

## Rewards remain separate

Water reports `crossedGoal` only for a **successfully persisted add** whose old
amount was below its day goal and new amount reaches/exceeds it. Reads, relaunch,
removal, default-goal edits and already-above-goal additions do not emit crossings.
The React composition captures local date and occurrence timestamp before saving,
then passes the successful fact to the existing water → active day → welcome
wallet workflow. No reward rules, grant identities or reward state live in Water.
Correction/re-crossing can emit another fact; persisted wallet identities reject
another same-day reward. Reward feedback still represents actual committed grants.

Water and wallet are separate storage records: a wallet write failure/crash after
a water save can leave water complete without reward. There is no reward on read
or automatic retry/outbox; a future reliable cross-store workflow must address
this explicitly. Do not claim atomicity across both features.

Run `npm run test:water` plus existing reward/wallet/integration/presentation tests.

## Today correction controls

Today exposes an accessible 44 pt secondary minus control (−250 ml) alongside the
existing orange +250 ml action. Minus is disabled for zero/unavailable amounts.
Both call the application hook and WaterService; quantities update from the
committed subscription only. While operations are pending, accepted taps continue
through the service's serialized queue, with no UI-side optimistic arithmetic.
Corrections persist across navigation/relaunch, including above-goal values.

Correction does not reverse any orange grant, active-day reward, or welcome reward.
A later same-day re-cross can emit a new water fact, but wallet identities grant
zero and presentation creates no notice. This follows the product-wide
[correctable tracking principle](../../../ARCHITECTURE.md#correctable-tracking-historical-economy).
The existing separate-water/wallet crash boundary above remains unchanged.
