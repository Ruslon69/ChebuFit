# Workouts and the local exercise catalog

TASK 23 supplies a read-only catalog of 36 built-in exercises. It does not create
workout templates, sessions, set logs, history, rewards or personal exercises.

- `domain/exercise.ts`: platform-independent Exercise/ExerciseId, controlled muscles,
  equipment and tracking types. Display content is locale-keyed; IDs are lowercase
  ASCII slugs independent of names. Russian technique copy is current; English
  aliases support search, and missing localized content explicitly falls back to RU.
- `data/builtinExercises.ts`: curated static source, not React component state,
  AsyncStorage, a network API or a copied commercial exercise database.
- `application/ExerciseCatalogRepository.ts`: synchronous immutable local read model:
  `getAll()`, `getById(id)`, `search({ text?, muscle?, equipment? })`.
  `LocalExerciseCatalog` detaches/freezes records and rejects duplicate IDs.
- `src/application/workouts/exerciseCatalog.ts`: composition. Screens query this
  catalog; a future personal catalog can be validated/loaded separately and composed
  into a materialized read model by ID. No persistence is needed for built-ins.
- `model/`: centralized RU/EN interface labels, detail projections and safe ID routing.
  `ui/`: Workouts entry, catalog/filter sheet and exercise detail. Root routes are
  `/exercises` and `/exercises/[id]`; an unknown/ambiguous ID produces a safe empty
  detail with a route back to the catalog.

## Taxonomy and queries

Muscles: chest, back, shoulders, biceps, triceps, forearms, quadriceps, hamstrings,
glutes, calves, abs, lowerBack. Primary muscles and optional secondary muscles are
ordered lists without duplicates or overlap. They are descriptive groups, not an
anatomical model. Muscle filtering deliberately matches **either primary or
secondary**, explained in the filter sheet.

Equipment: barbell, dumbbell, machine, cable, bodyweight, bench, pullupBar, ezBar,
kettlebell, other. Requirements may include several items. The filter only offers
items actually present in this catalog. Loaded lunge/split-squat variants explicitly
require dumbbells; bodyweight alternatives can later have distinct stable IDs.

Search is instant and offline. Trimmed, case-insensitive partial matching covers
localized names and common/English aliases, treating е/ё equally. Ranking is exact
name → name prefix → name substring → alias, then Russian alphabetical order and
ID as a tie-breaker. Muscle AND equipment AND search combine. Reset filters keeps
the query; the empty-state reset clears both. Neither discovery nor details invoke
Nutrition, Water, Wallet, storage or network operations.

## Tracking and future consumers

`weightReps` describes external-load exercises, `reps` covers push-ups, pull-ups and
hanging leg raises, and `duration` covers plank. These are metadata only, with no
logging fields or default/fictitious weights. Future added-weight and assistance
need explicit load semantics; bodyweight must not be silently treated as zero total
resistance. Unilateral sets will also need explicit side semantics in the session
model, not assumptions inferred from translated names.

TASK 24 workout templates should reference **ExerciseId**, with planned parameters
owned by the template. They must not embed competing canonical exercise definitions.
Future historical sessions should retain an appropriate exercise name/tracking/
content revision snapshot so later catalog edits or removal cannot rewrite history.
IDs must not be repurposed for a different movement. Future custom exercises need
namespaced durable IDs, validated content, persistence and eventual account/sync
conflict rules; none are implemented here. A Watch adapter can consume the same pure
IDs and tracking metadata without importing screens or Expo APIs.

## Media and content

Technique instructions (four short steps per exercise) and cues are original
ChebuFit copy describing common movement concepts. No commercial descriptions,
photos, watermarks or scraped media are imported. No exercise artwork is generated.
ExerciseMedia holds logical `illustrationAssetKey` and optional `thumbnailAssetKey`.
`model/exerciseMedia.ts` resolves these against the local Metro asset registry in
`src/shared/assets/exercises.ts`; the domain never imports native images. A single
canonical illustration is reused in both contexts unless an optimized thumbnail
is explicitly supplied. Unbound/missing media and image decode errors keep the
neutral fallback; they never hide exercise information. There are no URI/remote
image sources. Three reserved keys currently have **no assets bound**:
`barbell-bench-press`, `barbell-back-squat`, `plank`.

See [exercise asset convention](../../../assets/exercises/README.md) for approved
file registration. The hero uses a 3:2 frame capped at 200pt; the thumbnail is a
44pt square. Both use `contain`, independent of Dynamic Type. The hero fallback
has only subtle context; thumbnails are plain warm-neutral tiles. All artwork is
hidden from VoiceOver because exercise names, muscles and instructions provide
the meaningful information. Future technique frames/video can extend media later;
no player, animation or multi-frame API is implemented now.

## Exercise art specification — DRAFT

This direction remains **DRAFT until three reference illustrations are approved**.
Reference exercises: bench press (`barbell-bench-press`), back squat
(`barbell-back-squat`) and plank (`plank`). Do not scale production to the remaining
catalog until those three establish the style.

- First-party local artwork, consistent premium 3D fitness illustration.
- Neutral athletic human model with realistic athletic proportions, not exaggerated
  bodybuilding; clean fitted sportswear.
- Warm light/cream neutral background, dark neutral equipment and restrained
  ChebuFit orange accents. Optional subtle orange emphasis on primary working
  muscles; no medical/anatomical exposed-muscle rendering.
- Consistent camera, lens, lighting and rendering across the set. Correct exercise
  biomechanics, coherent equipment geometry, and every important body/equipment
  part visible with safe margins. Compose for both the detail hero and small square
  thumbnail using contain; never depend on text or a cropped pose to explain it.
- No baked-in text, logos, watermarks, external copyrighted exercise artwork,
  scraped assets or mixed visual styles.
- No images are generated, downloaded or supplied in TASK 23.1A. Approval will
  determine final production dimensions/style before wider artwork production.

Run `npm run test:exercises` for catalog invariants, queries, filters, bodyweight/
duration, immutable reads, localization, detail/route projections and offline tests.
Native route/back/filter/keyboard/Dynamic Type checks additionally run in iOS
Simulator; screenshots stay under `.artifacts/screenshots/task-23.1a/` for this media/density pass.

## Built-in exercise identities

| ID | Russian display name |
| --- | --- |
| barbell-bench-press | Жим штанги лёжа |
| incline-barbell-bench-press | Жим штанги на наклонной скамье |
| dumbbell-bench-press | Жим гантелей лёжа |
| incline-dumbbell-press | Жим гантелей на наклонной скамье |
| dumbbell-fly | Разведение гантелей лёжа |
| cable-fly | Сведение рук в кроссовере |
| machine-chest-press | Жим от груди в тренажёре |
| push-up | Отжимания |
| pull-up | Подтягивания |
| lat-pulldown | Тяга верхнего блока |
| barbell-row | Тяга штанги в наклоне |
| dumbbell-row | Тяга гантели одной рукой |
| seated-cable-row | Тяга горизонтального блока |
| chest-supported-row | Тяга гантелей с упором грудью |
| barbell-overhead-press | Жим штанги стоя |
| dumbbell-shoulder-press | Жим гантелей сидя |
| dumbbell-lateral-raise | Подъём гантелей через стороны |
| rear-delt-fly | Разведение гантелей в наклоне |
| face-pull | Тяга каната к лицу |
| barbell-back-squat | Приседания со штангой |
| leg-press | Жим ногами |
| romanian-deadlift | Румынская тяга |
| leg-extension | Разгибание ног в тренажёре |
| leg-curl | Сгибание ног в тренажёре |
| bulgarian-split-squat | Болгарские сплит-приседания с гантелями |
| walking-lunge | Выпады в ходьбе с гантелями |
| standing-calf-raise | Подъём на носки стоя в тренажёре |
| barbell-curl | Сгибание рук со штангой |
| dumbbell-curl | Сгибание рук с гантелями |
| hammer-curl | Молотковые сгибания |
| triceps-pushdown | Разгибание рук на блоке |
| overhead-triceps-extension | Разгибание рук с гантелью из-за головы |
| close-grip-bench-press | Жим штанги лёжа узким хватом |
| plank | Планка |
| cable-crunch | Скручивания на блоке |
| hanging-leg-raise | Подъём ног в висе |
