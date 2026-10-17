# ChebuFit approved mascot pack

## Asset rules

- `originals/` is the canonical, untouched artwork archive. Never edit, overwrite,
  crop, resize, recolor, or process these files.
- `app/` contains runtime-ready PNG copies. This first pack uses byte-identical
  copies: original dimensions, pixels, alpha, color information, and metadata.
- Import static references from `src/shared/assets/mascot.ts`; do not scatter
  asset paths or construct dynamic `require()` calls in feature code.
- **CHEBU-01 is the canonical master visual reference** for character consistency.
- Existing CHEBU numbers are permanent and must never be reassigned to another pose.
- New approved poses continue sequentially: CHEBU-13, CHEBU-14, and so on.
- Any future approved runtime optimization applies to `app/` only. Never upscale.
  Evaluate sizing against actual display needs before generating derivatives.
- Today uses `mascotAssets.greeting` (CHEBU-02) as decorative, contain-scaled
  artwork. Other poses remain available for future approved integrations.

## Stable catalog

| ID | Registry key | Filename in both directories | Purpose |
| --- | --- | --- | --- |
| CHEBU-01 | `master` | `CHEBU-01-master.png` | Canonical master / neutral reference for character consistency. |
| CHEBU-02 | `greeting` | `CHEBU-02-greeting.png` | Friendly greeting / wave, primarily intended for Today. |
| CHEBU-03 | `water` | `CHEBU-03-water.png` | Presenting water / hydration. |
| CHEBU-04 | `workout` | `CHEBU-04-workout.png` | Dumbbells / training pose. |
| CHEBU-05 | `success` | `CHEBU-05-success.png` | Celebration / achievement. |
| CHEBU-06 | `tip` | `CHEBU-06-tip.png` | Advice / help with clipboard or lightbulb. |
| CHEBU-07 | `orangeReward` | `CHEBU-07-orange-reward.png` | Presenting the orange reward / currency. |
| CHEBU-08 | `wardrobe` | `CHEBU-08-wardrobe.png` | Clothing / cosmetic items. |
| CHEBU-09 | `nutrition` | `CHEBU-09-nutrition.png` | Presenting food. |
| CHEBU-10 | `progress` | `CHEBU-10-progress.png` | Progress / statistics. |
| CHEBU-11 | `empty` | `CHEBU-11-empty.png` | Thoughtful / confused empty or missing-data state. |
| CHEBU-12 | `profile` | `CHEBU-12-profile.png` | Closer portrait / profile artwork. |

## Source provenance

The 12 numbered PNG files were moved from the project root into `originals/`.
The space before the extension in `CHEBU-01 .png` was normalized in the canonical
filename. SHA-256 checks verified that every original and app copy exactly matches
its source file. No image processing, recompression, cropping, or pixel edits were performed.

| Original root filename | Dimensions | Bytes (each original/app copy) | Alpha transparency |
| --- | --- | ---: | --- |
| `CHEBU-01 .png` | 1144 × 1375 | 1,945,228 | Yes |
| `CHEBU-02.png` | 1144 × 1375 | 1,835,366 | Yes |
| `CHEBU-03.png` | 1144 × 1375 | 1,748,469 | Yes |
| `CHEBU-04.png` | 1144 × 1375 | 1,738,586 | Yes |
| `CHEBU-05.png` | 1144 × 1375 | 1,622,013 | Yes |
| `CHEBU-06.png` | 1144 × 1375 | 1,728,049 | Yes |
| `CHEBU-07.png` | 1144 × 1375 | 2,009,719 | Yes |
| `CHEBU-08.png` | 1144 × 1375 | 2,260,605 | Yes |
| `CHEBU-09.png` | 1144 × 1375 | 1,871,261 | Yes |
| `CHEBU-10.png` | 1144 × 1375 | 2,209,680 | Yes |
| `CHEBU-11.png` | 1144 × 1375 | 1,624,813 | Yes |
| `CHEBU-12.png` | 1144 × 1375 | 1,910,440 | Yes |

The pack is 22,504,229 bytes per directory (about 21.46 MiB). Both directories
intentionally contain identical files; Git deduplicates their identical file blobs.
No dependencies or image-processing tools are required to consume the registry.
