import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { exerciseImageAssets } from '../../../shared/assets/exercises';
import { tokens as t } from '../../../shared/theme/tokens';
import { AppText } from '../../../shared/ui/AppText';
import type { ExerciseMedia } from '../domain/exercise';
import { exerciseArtworkLayout as layout, resolveExerciseArtwork } from '../model/exerciseMedia';

/** Supportive artwork only; the row/detail text supplies the accessible content. */
export function ExerciseArtwork({ media, context, fallbackLabel }: { media?: ExerciseMedia; context: 'thumbnail' | 'detail'; fallbackLabel?: string }) {
  const artwork = resolveExerciseArtwork(media, context, exerciseImageAssets);
  const [failedSource, setFailedSource] = useState<number>();
  const [width, setWidth] = useState(0);
  const heroHeight = width ? Math.min(width / layout.heroAspectRatio, layout.heroMaxHeight) : layout.heroMaxHeight;
  const hasImage = artwork.kind === 'image' && artwork.source !== failedSource;
  return <View style={[styles.base, context === 'detail' ? [styles.hero, { height: heroHeight }] : styles.thumbnail]}
    onLayout={context === 'detail' ? event => setWidth(event.nativeEvent.layout.width) : undefined} testID={`exercise-artwork-${context}`}
    accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {hasImage && artwork.kind === 'image' ? <Image source={artwork.source} resizeMode="contain" style={styles.image}
      accessible={false} onError={() => setFailedSource(artwork.source)} testID="exercise-artwork-image" /> :
      <View style={styles.fallback} testID="exercise-artwork-fallback">
        {context === 'detail' && <AppText variant="caption" tone="textTertiary" align="center" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{fallbackLabel}</AppText>}
      </View>}
  </View>;
}
const styles = StyleSheet.create({
  base: { backgroundColor: t.colors.surfaceSecondary, flexShrink: 0 },
  thumbnail: { width: layout.thumbnailSize, height: layout.thumbnailSize, borderRadius: t.radii.small },
  hero: { width: '100%', borderRadius: t.radii.card },
  image: { width: '100%', height: '100%' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: t.spacing.sm },
});
