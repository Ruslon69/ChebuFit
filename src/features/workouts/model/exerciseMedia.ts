import type { ExerciseMedia } from '../domain/exercise';

// Metro's static require() produces a local numeric image handle. URI sources are
// deliberately excluded: exercise artwork never introduces a network dependency.
export type ExerciseImageRegistry = Readonly<Record<string, number | undefined>>;
export type ExerciseArtworkSource = Readonly<{ kind: 'image'; assetKey: string; source: number }> | Readonly<{ kind: 'fallback' }>;
export function resolveExerciseArtwork(media: ExerciseMedia | undefined, context: 'thumbnail' | 'detail' | 'start' | 'end', registry: ExerciseImageRegistry): ExerciseArtworkSource {
  const keys = context === 'thumbnail' ? [media?.thumbnailAssetKey, media?.illustrationAssetKey] : context === 'detail' ? [media?.illustrationAssetKey] : [media?.phaseAssetKeys?.[context]];
  for (const key of keys) {
    if (!key || !Object.prototype.hasOwnProperty.call(registry, key)) continue;
    const source = registry[key];
    if (typeof source === 'number' && Number.isSafeInteger(source) && source > 0) return { kind: 'image', assetKey: key, source };
  }
  return { kind: 'fallback' };
}
// Image geometry is independent of Dynamic Type. Text flows outside/around it.
export const exerciseArtworkLayout = { thumbnailSize: 44, heroAspectRatio: 1.5, heroMaxHeight: 200 } as const;
