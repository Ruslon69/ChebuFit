# Personal foods

`domain/` owns validated personal food records and provider-neutral conversion.
`application/` owns the repository port, schema-v1 decoder and serialized service.
Neither imports React, Expo, AsyncStorage, HTTP or Rewards. `model/` contains exact
form parsing and centralized copy; `ui/` uses a thin `/personal-food` route.
Composition in `src/application/personal-foods` supplies existing AsyncStorage,
Expo's existing UUID generator and clock. The adapter lives in
`src/infrastructure/personal-foods`.

## State and precision

Key: `@chebufit/personal-foods/{real|developmentDemo}`. Both modes start empty;
there are no illustrative foods or automatic seeds in this catalog.

```text
{ schemaVersion: 1, mode, foods: [
  { id, name, brand?, barcode?, nutrients: {
      energyCentiKcal, proteinMg, fatMg, carbsMg
    }, createdAt, updatedAt }
] }
```

All nutrition is per 100g, in Nutrition's existing integer units. Form input accepts
comma/dot decimals, parsed directly to integers: up to two kcal decimal places and
three macro gram decimal places. Missing is not zero; explicit zero is valid.
Technical bounds: 0–1000 kcal and 0–100g for each macro per 100g. Names require
1–200 trimmed characters, optional brands 1–120, without control characters.
Negative, nonfinite, exponent/garbage and excess-precision input is rejected.
No 4/4/9 equality check is imposed: label energy can include other components and
rounding. No diet/weight-loss judgment or energy-consistency warning is added.

The schema validates identity, nutrients, timestamps/order, mode, duplicate IDs and
barcodes. Corrupt/newer data is preserved and reported, never silently replaced.
The decoder is the future migration boundary. A service queue shared by repository
identity serializes in-process reads/writes, including across service instances;
subscribers are notified only after successful persistence.

API: `getAll`, `getById`, `getByBarcode`, `search`, `create`, `update`, `delete`,
`subscribe`. Mutations capture validated input and return authoritative results.
Update preserves ID/createdAt; delete removes only the catalog record.

## Discovery and identity

`CatalogFood.source = { providerId: 'chebufit-personal', foodId: <stable UUID> }`.
Personal data is never uploaded to OFF. Explicit remote search still sends its
query under the existing OFF disclosure/privacy policy; typing alone stays local.
Personal search is immediate, local, case-insensitive and deterministic: name
prefix, name substring, then brand substring. No new remote request while typing.
My Foods and external results have separate headings; a subtle personal label and
44pt pencil action identify editable foods. Matching personal products appear once,
in My Foods; their duplicate Recent rows are suppressed.

`PersonalFirstFoodCatalog` composes barcode discovery: validate → personal lookup
→ existing external provider only if absent. A personal match wins over OFF for
that user, including during OFF cooldown/offline. No upload, nutrient merging or
OFF edit occurs. Corrupt/unavailable local state fails closed rather than silently
substituting a potentially conflicting OFF product.

Barcode input reuses the scanner normalizer and remains a string. Stored leading
zeroes are preserved; uniqueness also treats zero-padded GTIN equivalents as the
same code. Manual untyped eight-digit input means EAN-8. Camera-identified UPC-E
expands to UPC-A; scanner not-found passes its normalized lookup code to creation
so future scans resolve consistently. Invalid codes make no remote request.

## Form, Add and corrections

`/personal-food?date=YYYY-MM-DD&meal=...&barcode=...` creates;
optional `id` edits. Date/meal are explicit validated diary context. Scanner
not-found/incomplete-data states can open creation with the normalized barcode.
Save and add first commits a personal product, then opens the **existing** quantity/
meal selection. Save-only is implicit when that selection is cancelled: the
product remains saved and searchable. No default-100g automatic diary Add.

The pencil opens the same form for editing; delete requires a separate confirmation.
Duplicate barcode returns its existing product and offers Select or Edit, never
silent overwrite. Failed save retains the form and cannot feed the diary. Failed
subsequent diary Add retains the saved catalog product and the existing retry UX.
Keyboard-aware scrolling, decimal keyboards, a header Done action and labeled
field errors support keyboard and accessibility input. Nutrition fields stack at
large font scales; deletion confirmation scrolls if needed.

The shared Add operation resolves personal identity against canonical data before
snapshot conversion. Diary entries receive detached snapshots; editing 100→120
kcal changes future additions only. Deleting a catalog food never deletes diary
entries, changes totals/history or rewrites the reward ledger.

## Recents, rewards and limitations

Only successful committed diary Add records Recent. On read, personal references
resolve against the canonical catalog while retaining their original `addedAt`.
Edited nutrition cannot be overridden by an old Recent snapshot; deleted/missing
products are filtered and cannot be reused. Deletion also attempts queued Recent
cleanup. If that secondary write fails, canonical filtering remains authoritative.
This is separate from historical diary snapshots, which intentionally stay unchanged.

Create/edit/delete/search/lookup grant **zero** oranges. Only shared committed Add
emits the existing meal/active-day/welcome batch and one eligible feedback notice.
Diary date is where tracking belongs; reward identity uses current local action
day. Corrections never revoke grants and delete/re-add cannot farm daily rewards.

Personal food, diary, wallet and Recent stores are separate local commits. There
is no cross-store transaction/outbox or anti-cheat guarantee. Concurrent editing
elsewhere can change a selected food before commit; Add re-resolves current values.
Future account/backend sync needs cross-device IDs/versioning, conflict handling,
authoritative mutation ordering and the existing atomic wallet requirements.
No favorites, recipes, serving editor, images, extra nutrients or cloud sync.

Run `npm run test:personal-foods` plus existing catalog/scanner/OFF/Nutrition/
Water/wallet/reward checks. All automated scenarios use local fixtures. Native
validation covers create/250g Add, restart, edit, delete/history, duplicate barcode,
manual barcode local priority and not-found creation. OFF failure/mixed-result
screens use controlled provider responses, not a claim of physical network loss.
