# Food discovery and real diary additions

`domain/` defines provider-neutral catalog food, search/result/context, and recent
food ports. It reuses Nutrition's canonical nutrient units and math; the diary
never imports catalog/provider code. `application/FoodSearchController` is a pure,
async presentation model. React composition lives in `src/application/food-catalog`;
provider and AsyncStorage adapters live in `src/infrastructure/food-catalog`.

The normal runtime composition supplies Open Food Facts. See
`docs/OPEN_FOOD_FACTS.md` for endpoints, rates, validation, attribution and privacy.
An explicit development-only switch retains a deterministic catalog of 26
illustrative foods. Values, including named brands, are examples,
not verified commercial nutrition. Its optional provider-neutral disclosure is
shown in discovery. The fixture provider uses no network; neither provider adds
camera or remote images.
To add another provider, replace/compose `FoodCatalogProvider` in application
composition; normalize responses into `CatalogFood`, not provider-shaped objects.

A catalog food contains source/provider ID, source food ID, name, optional brand,
barcode/image URL, `per100g` nutrients, and optional future serving-to-grams metadata.
Stable identity is the JSON tuple `[providerId, foodId]`. `catalogFoodToSnapshot`
creates a detached validated Nutrition snapshot preserving source, food ID and
barcode. Later provider edits/deletions cannot rewrite diary entries. All math
uses the existing centi-kcal/milligram precision and half-up per-entry rounding.
No serving/volume UI or blanket milliliter-to-gram conversion is introduced.

## Search and selection

`/add-food?date=YYYY-MM-DD&meal=...` remains the routing contract. Context is
validated; historical date is preserved through meal changes and commit. Selection
is a dismissible native modal over search, retaining its query/results on cancel.
The default is 100g; positive decimal grams (comma/dot, up to three places) drive
a domain-derived live preview. Numeric keyboard has Done and a fixed Add footer;
preview condenses while the field is focused. Search scrolls above the keyboard.

Search preserves raw input in the form and trims only requests. Local fixture
search debounce is 300ms;
each query/clear/retry/dispose invalidates earlier generations and aborts where
supported. A provider ignoring cancellation still cannot overwrite newer results.
OFF uses explicit button/keyboard submit (minimum two characters), never debounce
requests. While typing, local Recents filter immediately. Prior results survive
remote failures, and typed cooldowns disable Retry. Initial suggestions, ready,
searching, results, empty, and retryable error states are separate. No fake
Recent/Frequent history. Recent snapshots remain selectable without a provider
response, including alongside search errors. OFF implements the optional barcode
port using v3.6. `/scan-food?date=YYYY-MM-DD&meal=...` adds camera/manual discovery
through the same provider and selection sheet; see `docs/BARCODE_SCANNING.md`.
Personal creation/editing is available outside the tab shell through `/personal-food`;
see `src/features/personal-foods/README.md`. Pagination and frequent-food ranking are future work.

## Commit, rewards and recents

Each selection owns a `createFoodAddOperation`. Concurrent/repeated submissions
share its successful result; a failed diary save allows retry. Order:

1. Convert catalog food to snapshot and persist `NutritionService.addEntry`.
2. Only its committed real `entryAdded` fact triggers one ordered wallet batch:
   `mealLogged`, `activeDayQualified(foodTracking)`, eligible `welcomeReward`.
3. Build one notice from the actual persisted grants and record a recent snapshot.
4. Dismiss the sheet, return to the existing diary, and present approved feedback.

The diary's selected date is historical data; **reward local day is the current
local day of the Add action**, explicitly captured by application composition.
Browsing different historical dates cannot earn repeated first-log bonuses today.
Stable source/event IDs retain entry traceability; existing daily/lifetime wallet
identities remain authoritative. Seed/read/search/view/cancel/edit/move/delete
never invoke this producer. Tracking corrections never reverse grants. No planned
meals qualification is fabricated. Fresh demo wallet: 248 → 265 (+17 celebration);
Water-established wallet: +2 micro. Repeated same-day adds: zero new feedback.

One application-level `RewardFeedbackProvider` hosts the existing two-level
presentation for Food and Water, surviving navigation. It is not a queue and does
not own rewards or balances. Wallet subscription remains balance authority.

Recent Foods schema v1: `{ schemaVersion: 1, foods: [{ food, addedAt }] }`, separate
real/demo keys. Only committed real additions create recents. Newest first,
deduplicated by provider identity, capped at 30, validated on load, serialized on
write. Seed data never populates it. Failure is secondary and never rolls back a
saved diary entry or encourages resubmitting Add. No favorites/usage algorithm.

Diary, wallet and recents are separate local commits. A crash/failure after saving
the diary can miss a reward/recent update; no atomic cross-store transaction or
outbox is claimed. A successful diary add is never reported as failed merely
because an optional follow-up failed. Future backend/sync must supply durable
idempotency, reconciliation and authoritative atomic wallet enforcement. In-process
submission deduplication is not crash-safe or an anti-cheat boundary.

Run `npm run test:scanner`, `npm run test:off`, `npm run test:food-catalog` and the existing
Nutrition/Water/wallet/reward tests. Offline fixtures never use live OFF servers.

Personal search is a separate immediate local section; OFF submission policy stays
unchanged. Barcode discovery checks the personal service first, then the existing
external adapter. Personal Recent references resolve to canonical values; missing
ones are filtered, and duplicates already in My Foods are not rendered again.
The shared Add operation rechecks personal identity before snapshot conversion.
