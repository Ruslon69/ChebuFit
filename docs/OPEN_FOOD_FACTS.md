# Open Food Facts integration

Reviewed official documentation on 2026-10-18. Read-only access is free and needs
no private API key. All OFF wire formats stay inside `infrastructure/food-catalog`.

## Endpoints and context

- Exact read: `GET https://world.openfoodfacts.org/api/v3.6/product/{barcode}`.
  The current introduction recommends v3.6. Its nutrition schema (since v3.5)
  uses `nutrition.aggregated_set`, not the old `nutriments` object.
- Keyword search: `GET https://world.openfoodfacts.org/cgi/search.pl` with
  `search_terms`, `action=process`, `json=1`, `page_size=25`. The current API
  introduction still lists legacy CGI as the full-text option; v2 is structured
  search, v3 has no search endpoint. This dependency is replaceable inside the
  adapter. Reassess Search-a-licious deployment/readiness before migrating.
- Public lookup defaults in `shared/config/foodCatalog.ts`: preferred names
  ru → en → nl, development market NL. Exact reads pass `lc`/`cc`. Global search
  uses the world host without a country filter so imported products stay visible;
  it requests explicit localized name fields and does not translate the query.
  Minimal legacy search avoids optional localization/filter parameters that
  returned 503 during validation. Localized-name selection remains client-side.
- Requested fields: `code`, `product_name`, preferred `product_name_XX` fields,
  `product_name_en`, `generic_name`, `brands`, `nutrition.aggregated_set`,
  `nutriments`, `quantity`, `nutrition_data_per`, `product_quantity_unit`,
  `serving_quantity`, `serving_quantity_unit`, `serving_size`. No ingredients,
  packaging structures, knowledge panels, or images are requested/rendered.

## Traffic, identification and failures

OFF currently documents 10 searches/minute/IP and 15 product reads/minute/IP.
It explicitly prohibits search-as-you-type. Remote typing only filters local
Recents; button/keyboard Search submits queries of at least two characters.
Local development fixtures retain 300ms debounce. No remote initial suggestions.

The adapter spaces searches by ≥12 seconds (≤5/minute) and reads by ≥5 seconds
(≤12/minute), within one application runtime. Duplicate in-flight/successful
submissions are suppressed by the controller. An attempted request consumes its
slot even if cancelled. HTTP 429 blocks requests for at least 60 seconds, server
5xx for at least 30 seconds, respecting a longer Retry-After seconds/date header.
Retry is user-driven; no automatic retry/fallback request loop. Shared IP traffic,
other apps and restarts can still hit OFF limits; this is not an IP-wide limiter.

Timeout is 20 seconds via AbortController. Typed errors distinguish network,
timeout, rateLimited, server, malformedResponse, invalid query/barcode and
cancellation. UI shows centralized friendly messages, retains prior good search
results and local Recents, and disables retry during the supplied cooldown.
No raw error, query or personal-data logging is added.

User-Agent is `ChebuFit/<app version> (https://github.com/Ruslon69/ChebuFit)`;
this is the actual public repository, not an invented support website/address.
It is configured centrally and sent in native fetch headers. iOS transmission
was verified against a temporary localhost header reflector. React Native native
networking accepts caller headers; Android device verification remains future
work. Browser fetch can forbid overriding User-Agent: this implementation targets
iOS/Android, and a web release needs a separately validated identification strategy.
The OFF usage-registration form should be completed by the owner before broad
release; no account or form submission is performed by this task.

## Qualification and snapshot safety

A usable result needs a numeric GTIN-like code (8, 12, 13 or 14 digits, not all
zeroes), nonempty usable name and explicit calories/protein/fat/carbohydrates.
Whitespace/control markup is cleaned; absent brands are optional, not fabricated.
Prefer configured localized name, then main name, English and generic name.

v3 uses only normalized `aggregated_set`, with `per=100g`,
`preparation=as_sold`, explicit kcal/g units and unmodified numeric values.
Legacy search rejects nonstandard nutrient units/modifiers and uses only unprepared `energy-kcal_100g`, `proteins_100g`,
`fat_100g`, `carbohydrates_100g`; never raw serving values or prepared fields.
Missing is never zero. Energy/energy-kj is never treated as kcal; kcal missing
means the product is omitted, without an inferred conversion. Numeric values
must be finite nonnegative numbers or plain decimal strings. Hard safety bounds
are 1000 kcal and 100g per macro/100g, combined macros ≤105g to allow label
rounding. These are sanity filters, not validation of community accuracy or
ranking by diet/calories/Nutri-Score. Oils/high-energy foods remain eligible.

v3's explicit 100ml profiles are omitted because the diary currently implements
grams only. Legacy records with explicit volume package/serving units are also
omitted. Legacy volume metadata can be incomplete, so its mass basis is less
certain; no blanket ml-to-g conversion is introduced. Supporting liquids fully
requires an explicit basis/density extension later.

Search examines at most one 25-product page and displays at most 20 valid foods;
filtering may leave fewer. Deduplication preserves the first valid barcode and
provider order. Normalized v3 and legacy formats are never blended when a current
nutrition object is present but invalid. Values enter the existing canonical
centi-kcal/milligram math and detached FoodSnapshot conversion. Barcode lookup
returns `ok: true, value: null` for not-found, `invalidFood` for unusable data.
Barcode camera/manual discovery reuses this exact read path and its cooldown;
see `BARCODE_SCANNING.md` for scanner permissions, normalization and lifecycle.

## Composition, offline use and rewards

OFF is the default runtime provider. Opt into deterministic development fixtures
only with `EXPO_PUBLIC_FOOD_CATALOG_PROVIDER=development` in a development build;
restart Metro when switching. Production ignores this switch. No fake products
are merged into OFF results; existing illustrative recents are retained in storage
but hidden in the OFF composition.

Committed OFF adds use unchanged NutritionService → ordered wallet batch → one
existing feedback notice. Search, read, barcode lookup, failures, seed and reload
grant nothing. Selected diary date is preserved; reward identity uses action day.
Corrections do not reverse grants; same-day delete/re-add cannot farm currency.
Recent Foods persist provider-neutral snapshots and can be selected/added offline
without fetching OFF. Diary snapshots never follow later OFF edits/deletions.
The documented separate diary/wallet/recent commit crash boundary remains.

## Attribution, licensing and privacy

Search includes compact links to Open Food Facts and ODbL 1.0. Source identity is
retained in diary/recents; reuse this attribution in future Settings → Data Sources.
See `DATA_SOURCES.md` for the notice, licenses and release obligations.

Queries and looked-up barcodes now leave the device over HTTPS. OFF receives the
necessary query/fields/language/market context, public app User-Agent and ordinary
network metadata such as IP address. Requests omit cookies/credentials. No user
name/account ID, weight, targets, diary history or wallet information is sent.
Future Privacy Policy must disclose this third-party lookup and linked OFF policy.
Recents remain on-device; selecting them alone requires no request. No analytics.

A larger release may need OFF data ingestion/cache/search on a ChebuFit backend
for reliability, multilingual normalization, ranking, corrections and provider
merging. Review licensing of a public derived database and durable rate limiting
first. No backend, offline API cache, paid service or dataset import is built now.

## Official references

- [API introduction, versions, rate limits and search](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/)
- [v3 OpenAPI specification](https://github.com/openfoodfacts/openfoodfacts-server/blob/main/docs/api/ref/api-v3.yaml)
- [v3 nutrition schema](https://github.com/openfoodfacts/openfoodfacts-server/blob/main/docs/api/ref/schemas/product_nutrition_v3.yaml)
- [Legacy normalized nutrition](https://openfoodfacts.github.io/openfoodfacts-server/dev/explain-nutrition-data/)
- [OFF licensing guidance](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/)
- [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/)
