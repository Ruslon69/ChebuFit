# ChebuFit Exercise Catalog v1 — approved 60

The local read-only catalog contains **exactly 60 active exercises**. It does not
create workout templates, sessions, logs, history or rewards. No exercise artwork
is generated or imported in this task.

## Architecture and permanent identity

- `domain/exercise.ts`: platform-neutral Exercise, ExerciseId, catalog number,
  detailed taxonomies, tracking and group/equipment predicates.
- `data/builtinExercises.ts`: explicit approved static records, original ChebuFit
  technique copy and English/common search aliases. No network or storage.
- `application/ExerciseCatalogRepository.ts`: immutable synchronous read port:
  `getAll()`, `getById(id)`, `search({ text?, group?, muscle?, equipment? })`.
  `LocalExerciseCatalog` detaches/freezes data and rejects duplicate IDs/numbers,
  malformed numbers, conflicting aliases or alias targets absent from the catalog.
- `src/application/workouts/exerciseCatalog.ts`: built-in composition with explicit
  compatible ID spellings from `data/exerciseCompatibility.ts`.
- `model/`: RU/EN labels, safe routes, projections and local artwork resolution.
  `ui/`: Workouts entry, grouped catalog/filter sheet, detail and decorative artwork.

**ExerciseId remains the canonical machine-readable identity.** A catalog number
is a separate public reference: `EX-001` through `EX-060`, stored literally in each
record, never calculated from its array index, list position, name or sort order.
Numbers are unique; filtering, localization and sorting never change them. New
exercises start at **EX-061**. Removing/deprecating an exercise must leave its number
reserved forever; never compact the sequence or reassign a number/ID to another
movement. The committed approval fixture/table provide the v1 allocation record.
Future custom exercises require their own durable namespaced IDs/allocation policy.

## Compatibility decisions

Existing canonical IDs are retained for the same movements. These approved alternate
slugs resolve to that same object/number through `getById`, without extra rows:

| Approved spelling | Retained canonical ExerciseId |
| --- | --- |
| cable-chest-fly | cable-fly |
| dumbbell-chest-fly | dumbbell-fly |
| barbell-bent-over-row | barbell-row |
| one-arm-dumbbell-row | dumbbell-row |
| seated-dumbbell-shoulder-press | dumbbell-shoulder-press |
| dumbbell-reverse-fly | rear-delt-fly |
| cable-triceps-pushdown | triceps-pushdown |
| overhead-dumbbell-triceps-extension | overhead-triceps-extension |
| lying-leg-curl | leg-curl |

The former generic `leg-curl` ID remains the lying variation (EX-043), with explicit
lying technique copy; the seated variation has its own new ID EX-044. No persisted
workout history/templates exist, so no storage migration is necessary. Display-name
changes preserve former Russian names among search aliases.

Three development entries are retired from active v1: `machine-chest-press`,
`chest-supported-row`, `walking-lunge`. They have no EX allocation and are recorded
as retired IDs, never repurposed or silently redirected to a different movement.
In particular, walking lunges and return-to-stance dumbbell lunges are distinct.
Old retired routes safely show the existing unavailable-exercise state. All other
previous canonical IDs remain active. Unknown/ambiguous route IDs remain safe.

## Groups and detailed taxonomy

Primary browsing groups, in order: **Грудь, Спина, Плечи, Руки, Ноги, Ягодицы,
Пресс и корпус, Всё тело**. The canonical group is derived from the first primary
muscle through one exhaustive mapping, not duplicated in each record:

- chest → chest; back/lowerBack → back;
- shoulders/rearShoulders/traps → shoulders;
- biceps/triceps/forearms → arms;
- quadriceps/hamstrings/calves/posteriorChain/hipFlexors/legs → legs;
- glutes → glutes; abs/core/obliques → core; fullBody → fullBody.

The 20 controlled detailed muscle IDs are `chest`, `back`, `shoulders`,
`rearShoulders`, `traps`, `biceps`, `triceps`, `forearms`, `quadriceps`, `hamstrings`,
`glutes`, `calves`, `abs`, `lowerBack`, `core`, `obliques`, `posteriorChain`,
`hipFlexors`, `legs`, `fullBody`. Primary/secondary arrays are ordered, nonduplicated
and disjoint. These are practical training groups, not a medical anatomy model.
The secondary detailed muscle sheet remains available and matches either primary
or secondary muscles.

Farmer's Walk EX-059 is canonically **Пресс и корпус** (primary core), with explicit
additional discovery in **Всё тело**. The All view lists it only once in its
canonical section; group filtering finds it in either of those two groups.
Burpee EX-060 is canonically Всё тело. Calves are grouped under Ноги.

## Equipment and tracking

Equipment IDs: `barbell`, `dumbbells`, `machine`, `cable`, `bodyweight`, `bench`,
`pullUpBar`, `ezBar`, `kettlebell`, `rack`, `dipBars`, `preacherBench`, `other`,
`machineOrBarbell`, `barbellOrEzBar`, `dumbbellOrKettlebell`.
The temporary old tokens `dumbbell`/`pullupBar` are normalized to approved
`dumbbells`/`pullUpBar`; no filters or exercise definitions are persisted.

An equipment array describes required items (barbell **and** bench). A composite
item explicitly means one-of (barbell **or** EZ bar). Equipment filters offer actual
individual items and expand alternatives: T-bar row matches machine or barbell;
preacher curl matches barbell or EZ bar and also its preacher bench; goblet squat
matches dumbbells or kettlebell. Alternatives are never interpreted as needing both.

Tracking remains `weightReps` (Вес и повторения), `reps` (Повторения), `duration`
(Время). Bodyweight movements do not invent external weights. Planks and Farmer's
Walk use duration; future carry distance, added load/assistance and unilateral side
semantics need deliberate extensions, not guesses from translated names.

## Search and browsing

Instant offline partial search considers Russian display names and retained/common
English aliases. Whitespace collapses, matching is case-insensitive and е/ё equal.
Ranking remains exact name → name prefix → name substring → alias, then Russian
alphabetical order/ID. All 60 have English aliases; bench, RDL, squat, deadlift and
new movements work without a network/debounce dependency.

The initial All view is divided into the eight primary-group sections rather than
one undifferentiated 60-row card. Horizontal group chips switch to a focused view;
the detailed muscle/equipment sheets remain secondary. Search uses the repository's
ranked flat results, or the selected group's results. Group AND detailed muscle AND
equipment AND text combine. Reset filters keeps the query; empty-state reset clears
both. Rows/detail expose the permanent number, while navigation uses ExerciseId.

## CHEBU-01 artwork contract — direction fixed, reference art pending

**Canonical CHEBU-01 is the exercise demonstrator for every future technique
illustration. Do not create a human demonstrator.** The earlier TASK 23.1A draft
human-model proposal is superseded. Three reference compositions (EX-001 bench,
EX-035 squat, EX-055 plank) still need visual approval before wider production.

- First-party consistent premium 3D CHEBU-01 performing the actual movement; preserve
  the mascot's canonical identity/proportions. Correct pose and equipment geometry.
- Warm cream/light background, dark neutral equipment, restrained ChebuFit orange.
  No anatomical gore/muscle rendering, baked-in text, logos or watermarks.
- Consistent camera/lens/lighting; all important body/equipment visible with safe
  margins for contain in a bounded hero and a small square thumbnail.
- No external copyrighted exercise art, scraped assets, fake human placeholders,
  exercise animations/video or generated artwork in this task.

`media.illustrationAssetKey` identifies the canonical local hero; optional
`thumbnailAssetKey` overrides the thumbnail, otherwise one asset serves both.
Optional `phaseAssetKeys: { start?, end? }` reserves static movement phases without
implementing a phase viewer. Absent phases safely resolve to fallback, never a
mislabelled hero frame. Media maps and phases are detached/frozen by the repository.

Naming: **<catalogNumber>-<canonical ExerciseId>.png** (or approved `.webp`), e.g.
`EX-001-barbell-bench-press.png`, `EX-002-dumbbell-bench-press.png`,
`EX-035-barbell-back-squat.png`, `EX-055-plank.png`, `EX-060-burpee.png`.
Compatibility spellings never create duplicate assets. All 60 keys/paths are
reserved in `src/shared/assets/exercises.ts`, with **no image bindings/files** yet.
After manual approval, add an existing file under `assets/exercises/app/` and a
literal static require binding. See [asset convention](../../../assets/exercises/README.md).

The hero is 3:2 up to 200pt; thumbnails are 44pt. `contain` avoids important cropping,
with geometry independent of Dynamic Type. Unbound/missing media or decoding errors
leave the quiet fallback; names, muscles and instructions remain useful. No image
URLs/network dependency. Decorative art is hidden from VoiceOver.

## Future consumers

TASK 24 templates must reference ExerciseId, not EX number or a duplicated canonical
Exercise object. Historical sessions will need appropriate name/tracking/content
snapshots/versioning so future catalog changes cannot rewrite history. Catalog
numbers remain public references. Future personal exercises can be validated and
composed through the same repository, with a separately defined numbering policy.
Watch can consume pure stable IDs and tracking metadata without React Native/Expo
screens; no Watch code, sessions or backend is introduced here.

## Validation

`npm run test:exercises` checks the full approved manifest, identities/numbers,
reorder stability, aliases, group/detail/equipment AND filters, search, immutable
reads, local artwork/absent phases, localization and safe routes. All project test
suites run separately. Native iPhone Duo validation covers group/search/filter/detail,
normal/large/max Dynamic Type, keyboard, back/relaunch and existing modules.
Artifacts stay under `.artifacts/task-23.1b/` and screenshots under
`.artifacts/screenshots/task-23.1b/`; neither is committed.

## Approved allocation table

The ExerciseId column contains canonical retained IDs. Alternate approved spellings
are documented above and resolve to these same records.

| catalogNumber | ExerciseId | Russian name | Top-level primary group |
| --- | --- | --- | --- |
| EX-001 | barbell-bench-press | Жим штанги лёжа | Грудь |
| EX-002 | dumbbell-bench-press | Жим гантелей лёжа | Грудь |
| EX-003 | incline-dumbbell-press | Жим гантелей на наклонной скамье | Грудь |
| EX-004 | incline-barbell-bench-press | Жим штанги на наклонной скамье | Грудь |
| EX-005 | cable-fly | Сведение рук в кроссовере | Грудь |
| EX-006 | dumbbell-fly | Разведение гантелей лёжа | Грудь |
| EX-007 | push-up | Отжимания | Грудь |
| EX-008 | chest-dip | Отжимания на брусьях | Грудь |
| EX-009 | pull-up | Подтягивания | Спина |
| EX-010 | lat-pulldown | Тяга верхнего блока | Спина |
| EX-011 | barbell-row | Тяга штанги в наклоне | Спина |
| EX-012 | dumbbell-row | Тяга гантели одной рукой | Спина |
| EX-013 | seated-cable-row | Горизонтальная тяга блока | Спина |
| EX-014 | t-bar-row | Тяга Т-грифа | Спина |
| EX-015 | straight-arm-pulldown | Пуловер на верхнем блоке | Спина |
| EX-016 | back-extension | Гиперэкстензия | Спина |
| EX-017 | barbell-overhead-press | Жим штанги над головой | Плечи |
| EX-018 | dumbbell-shoulder-press | Жим гантелей сидя | Плечи |
| EX-019 | arnold-press | Жим Арнольда | Плечи |
| EX-020 | dumbbell-lateral-raise | Подъём гантелей в стороны | Плечи |
| EX-021 | dumbbell-front-raise | Подъём гантелей перед собой | Плечи |
| EX-022 | rear-delt-fly | Обратное разведение гантелей | Плечи |
| EX-023 | face-pull | Face Pull | Плечи |
| EX-024 | shrug | Шраги | Плечи |
| EX-025 | barbell-curl | Сгибание рук со штангой | Руки |
| EX-026 | dumbbell-curl | Сгибание рук с гантелями | Руки |
| EX-027 | hammer-curl | Молотковые сгибания | Руки |
| EX-028 | preacher-curl | Сгибание рук на скамье Скотта | Руки |
| EX-029 | cable-biceps-curl | Сгибание рук на нижнем блоке | Руки |
| EX-030 | triceps-pushdown | Разгибание рук на блоке | Руки |
| EX-031 | lying-triceps-extension | Французский жим | Руки |
| EX-032 | overhead-triceps-extension | Разгибание гантели из-за головы | Руки |
| EX-033 | close-grip-bench-press | Узкий жим штанги лёжа | Руки |
| EX-034 | overhead-cable-triceps-extension | Разгибание рук на блоке над головой | Руки |
| EX-035 | barbell-back-squat | Приседания со штангой | Ноги |
| EX-036 | barbell-front-squat | Фронтальные приседания | Ноги |
| EX-037 | leg-press | Жим ногами | Ноги |
| EX-038 | leg-extension | Разгибание ног в тренажёре | Ноги |
| EX-039 | dumbbell-lunge | Выпады с гантелями | Ноги |
| EX-040 | bulgarian-split-squat | Болгарские сплит-приседания | Ноги |
| EX-041 | goblet-squat | Goblet-приседания | Ноги |
| EX-042 | romanian-deadlift | Румынская тяга | Ноги |
| EX-043 | leg-curl | Сгибание ног лёжа | Ноги |
| EX-044 | seated-leg-curl | Сгибание ног сидя | Ноги |
| EX-045 | conventional-deadlift | Становая тяга | Ноги |
| EX-046 | barbell-hip-thrust | Hip Thrust со штангой | Ягодицы |
| EX-047 | glute-bridge | Ягодичный мост | Ягодицы |
| EX-048 | cable-glute-kickback | Отведение ноги назад в кроссовере | Ягодицы |
| EX-049 | hip-abduction-machine | Отведение ног в тренажёре | Ягодицы |
| EX-050 | standing-calf-raise | Подъём на носки стоя | Ноги |
| EX-051 | seated-calf-raise | Подъём на носки сидя | Ноги |
| EX-052 | crunch | Скручивания | Пресс и корпус |
| EX-053 | hanging-leg-raise | Подъём ног в висе | Пресс и корпус |
| EX-054 | hanging-knee-raise | Подъём коленей в висе | Пресс и корпус |
| EX-055 | plank | Планка | Пресс и корпус |
| EX-056 | side-plank | Боковая планка | Пресс и корпус |
| EX-057 | cable-crunch | Скручивания на верхнем блоке | Пресс и корпус |
| EX-058 | russian-twist | Русские скручивания | Пресс и корпус |
| EX-059 | farmers-walk | Фермерская прогулка | Пресс и корпус |
| EX-060 | burpee | Берпи | Всё тело |
