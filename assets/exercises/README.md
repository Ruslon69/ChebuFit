# First-party exercise artwork

No final exercise illustrations exist yet. The three reference illustrations must
be manually approved before scaling the set; see the **DRAFT** specification in
[src/features/workouts/README.md](../../src/features/workouts/README.md).

- `originals/<ExerciseId>.png`: approved original/archive, preserved without runtime
  resizing/overwriting, following the mascot originals/app separation.
- `app/<ExerciseId>.png`: prepared runtime illustration. Use a stable exercise ID,
  never a translated name (e.g. `barbell-bench-press.png`,
  `barbell-back-squat.png`, `plank.png`). No duplicate thumbnail file is required.
- Runtime registry: `src/shared/assets/exercises.ts`. Reservations are metadata,
  **not** require() calls to absent files. Once approved artwork is supplied, add a
  literal static binding, for example
  `'plank': require('../../../assets/exercises/app/plank.png') as number`.
  Metro must see literal existing paths; merely copying a file does not register it.
- Built-in `media.illustrationAssetKey` selects that binding. The same registered
  source serves detail and thumbnail. An optional `thumbnailAssetKey` permits a
  separately optimized asset later, only where useful.
- RN Image renders with contain: preserve all important body/equipment, allow safe
  canvas margins, and do not crop to fill. No external image URLs or image library.
- Unbound keys retain the neutral fallback. Never add fake artwork/stick figures,
  downloaded exercise images or copyrighted image sets to fill it.

Task captures and experimental/debug outputs belong to ignored
`.artifacts/screenshots/task-XX/` and `.artifacts/task-XX/`, not these product asset
folders. The empty app/originals folders are deliberately reserved with .gitkeep.
