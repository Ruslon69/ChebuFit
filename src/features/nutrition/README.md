# Persistent nutrition diary

`domain/` contains pure IDs, meal identifiers, provider-neutral food snapshots,
quantities, targets and calculations. `application/` owns the repository port,
versioned state/decoder, and serialized service. Neither imports React, Expo,
AsyncStorage, provider SDKs, networking, or Rewards. `model/` contains an explicit
demo diary and a display-only Today projection. Composition lives in
`src/application/nutrition`; AsyncStorage implementation lives in infrastructure.

## Historical facts and precision

Every entry has its own stable ID, explicit local date, meal, food snapshot,
quantity and created/updated timestamps. Identical foods can be logged twice.
Snapshots copy name, optional brand/source IDs/barcode, and nutrition **per 100 g**.
They never look up a mutable food/provider record when calculating history.
Quantity edits and meal moves retain ID, creation timestamp and food snapshot;
deleting removes only that tracking entry. There is no replace-food operation.

Canonical numeric values are nonnegative safe integers:

- `quantity: { unit: 'g', milliGrams }`: positive mass, resolution 0.001 g.
  API gram input rounds once to nearest milligram; values rounding to zero fail.
- `energyCentiKcal`: hundredths of a kcal.
- `proteinMg`, `fatMg`, `carbsMg`: thousandths of a gram.

Provider adapters must normalize raw values into these units before constructing
a `FoodSnapshot`; malformed, negative or fractional canonical units are rejected.
Entry math uses exact BigInt multiplication and half-up division by 100000
(the milligrams in 100 g), then returns safe integer canonical units. BigInt is
never persisted. Meal/day totals sum these rounded entry units exactly; overflow
rejects the operation. Recalculation always starts from the snapshot/quantity,
never previously rounded display totals. Two rounded half-portions can differ
from one whole portion by a canonical unit; the policy is per-entry rounding.
Remaining values clamp at zero. The Today adapter rounds display kcal/macros to
whole numbers; it does not own or persist canonical totals.

Targets are current goals, separate from historical diary facts. Energy targets
are positive; macro targets may be zero and are never negative. Initial defaults
are 2845 kcal / 185 P / 65 F / 380 C, replaceable through `setTargets` by future
onboarding/profile calculations. Changing targets changes comparisons, not entry
snapshots/totals. Historical target versioning is not implemented in this task.

## Persistence and operations

Schema v1 is `{ schemaVersion: 1, mode, targets, developmentSeed, diaries }`.
Each diary holds `{ localDate, entries, createdAt, updatedAt }`. No derived totals
are stored. Decoder validates dates, global entry ID uniqueness, meals, quantities,
snapshots, targets, metadata and safe totals. Corrupt/newer data returns a typed
error without being replaced. The decoder is the future migration boundary.
Keys are `@chebufit/nutrition/real` and `@chebufit/nutrition/developmentDemo`.

`NutritionService` exposes:

- `getDay(localDate)` → diary, targets and authoritative summary (meal/day/remaining).
  Filter `view.diary.entries` by `meal`; empty meals have zero totals.
- `addEntry({ localDate, meal, food, quantityGrams })`.
- `updateEntryQuantity(localDate, entryId, grams)`.
- `moveEntry(localDate, entryId, meal)`; `deleteEntry(localDate, entryId)`.
- `getTargets`, `setTargets`, `getHistory(from, through)`, `subscribe`.
- Guarded code-only `resetForDevelopment(localDate)` for demo data.

Mutations save before reporting success/notifying subscribers; failed saves do
not publish an unsaved change or fact. The queue is shared by storage identity
across services in one JS process, preventing lost concurrent add/edit updates.
IDs/time are injected for deterministic tests; native composition uses Expo's
already-installed UUID v4 API. Reads/seed creation do not emit change events.

Local dates are caller-supplied through shared calendar utilities, never inferred
from UTC timestamps. New days are lazy/independent; previous dates remain editable.
History reads do not fabricate missing days. React refreshes on focus, foreground
and committed service changes, with loading/error states and stale-read protection.
No midnight timer or permanent debug UI is introduced.

## Explicit development mode

The first requested demo day receives 11 entries (oats, eggs, banana, chicken,
rice, olive oil, salmon, potatoes, vegetables and yogurt). Subsequent new days are
empty. The metadata records the seeded date/version; deleting seed entries never
re-seeds an ordinary read. No historical weeks are fabricated. Real mode starts
empty and never adopts demo data.

| Meal | kcal |
| --- | ---: |
| Breakfast | 516.30 |
| Lunch | 679.77 |
| Dinner | 547.70 |
| Snacks | 201.20 |
| Day | 1944.97 |

Actual macros: 127.570 g protein / 46.978 g fat / 241.000 g carbs. These are derived
from entries, not aggregate seed constants. Today remains visually populated.

## Boundaries and future work

A successful real `addEntry` returns one `entryAdded` fact (entry/date/meal/time).
Seed, reads, quantity edits, moves and deletes do not return that fact. Nutrition
domain/service operations do not grant oranges themselves. Real Add Food
application composition now passes a committed user-add fact to Rewards;
seed/read/relaunch events never qualify. Corrections must not
rewrite/reverse granted oranges: see the product-wide correctable tracking rule.

Future Open Food Facts/FatSecret/custom/recent/barcode adapters provide snapshots;
HTTP/provider knowledge stays outside the diary. Future serving UI (piece, slice,
package, volume) resolves its declared serving/mass conversion to canonical grams
and can retain original serving metadata in an additive schema evolution. Volume
requires a known conversion, never a blanket 1 ml = 1 g assumption. Existing v1
snapshot math remains interpretable; no serving/provider/search UI is built here.

Local JSON persistence is not a security, cross-process, or multi-device transaction
boundary. Future sync needs authoritative conflict resolution, stable delivery IDs,
and atomic writes. Whole-record history is adequate for MVP; growth eventually
needs a storage migration. No backend or cross-device synchronization.

Run `npm run test:nutrition` and the existing Water/reward/wallet/presentation tests.

## Daily diary experience

The Nutrition tab owns only selected local date and form drafts. `useNutritionDiary`
loads authoritative views on focus, foreground and service commits; stale responses
cannot replace a newly selected day. Dates use local device calendar getters.
Previous/next arrows browse through today; tapping the date returns to today, and
Home opens the Today tab. Future navigation is disabled. Missing historical days
use `getDay(date, { readOnly: true })`: a zero summary without persisting a diary,
consuming the demo seed, or generating facts. Existing historical days remain editable.

Meal rows derive nutrition through domain calculations, once per selected view,
and use stable entry IDs. Entry editing keeps grams/meal as drafts. Save invokes
`updateEntryDetails(date, id, { quantityGrams, meal })`, one serialized operation
and one persistence write for both changes. Quantity accepts positive decimal grams
(up to three places, dot or comma); saves are guarded against repeat submission.
Delete requires a separate confirmation and retains the existing correctable-tracking
semantics. Failed writes keep the editor open with a retryable message. The sheet
scrolls with the keyboard and keeps Save reachable; all mutations notify Today.

`/add-food?date=YYYY-MM-DD&meal=breakfast|lunch|dinner|snacks` is a typed navigation
contract. The Food Catalog feature now implements search and selection using an
injected development provider. It converts the selected catalog food to a snapshot
and persists through NutritionService before optional reward/recent follow-ups.
Global Quick Add remains unchanged. Seed/read/date-navigation/edit/move/delete
operations still grant nothing. See `../food-catalog/README.md` for action-day vs
diary-date semantics, catalog ports, recent snapshots and failure boundaries.

UI copy is centralized in `model/messages.ts`; dates/numbers use locale formatters.
Read errors/loading show no fabricated totals. Meal progress and controls expose
accessible labels/states; layout wraps at larger text sizes, with opt-in shared scale limits (headings 1.6×, body 2×, controls 1.8×). Numeric keyboard has
an inline Done action and a fixed Save footer, with no keyboard dependency.

Run `npm run test:nutrition-ui` for projection, routing context, calendar navigation,
quantity parsing, non-persisting browsing and atomic edit integration checks. Native
simulator validation additionally exercises the actual UI handlers and inspects
screenshots, keyboard, persistence and existing Today/Water/Quick Add behavior.
