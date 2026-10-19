# First-party CHEBU-01 exercise artwork

Canonical **CHEBU-01**, not a human model, demonstrates every future exercise.
No artwork files exist yet. The reference compositions EX-001, EX-035 and EX-055
must be manually approved before scaling production; see the
[workouts specification](../../src/features/workouts/README.md).

- `originals/<catalogNumber>-<ExerciseId>.png`: preserve approved originals.
- `app/<catalogNumber>-<ExerciseId>.png` (or approved WebP): runtime illustration.
  Examples: `EX-001-barbell-bench-press.png`, `EX-035-barbell-back-squat.png`,
  `EX-055-plank.png`, `EX-060-burpee.png`.
- Number and canonical ExerciseId are permanent; never derive filename numbering
  from array position, sorting or translated names. Future additions start EX-061;
  retired numbers are never reused. Compatible slug spellings do not duplicate art.
- `src/shared/assets/exercises.ts` reserves all 60 logical keys/paths. Reservations
  are metadata, not require() calls to absent files. After manual approval, bind an
  existing file with a literal require, e.g.
  `'EX-055-plank': require('../../../assets/exercises/app/EX-055-plank.png') as number`.
  Copying a file alone does not register it with Metro.
- One canonical illustration serves hero and thumbnail. `thumbnailAssetKey` is
  optional. `phaseAssetKeys.start/end` can later name static phase variants such as
  `EX-001-barbell-bench-press-start.png`; no phase UI/animation is implemented.
- RN Image uses contain with full important body/equipment visible. Warm-neutral
  fallbacks are intentional until approval. No remote image URLs, human placeholder
  art, scraped exercise images, copyrighted sets or generated drawings.

Screenshots and experimental files belong under ignored `.artifacts/`, not product
asset folders. Empty app/originals directories remain reserved with .gitkeep.
