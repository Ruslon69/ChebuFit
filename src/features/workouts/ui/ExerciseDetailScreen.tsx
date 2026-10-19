import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { exerciseCatalog } from '../../../application/workouts/exerciseCatalog';
import { appConfig } from '../../../shared/config/app';
import { tokens as t } from '../../../shared/theme/tokens';
import { AppText } from '../../../shared/ui/AppText';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Screen } from '../../../shared/ui/Screen';
import { presentExercise, resolveExercise } from '../model/exercisePresentation';
import { getExerciseMessages } from '../model/messages';
export function ExerciseDetailScreen({ id }: { id: unknown }) {
  const locale = appConfig.defaultLocale, copy = getExerciseMessages(locale), router = useRouter();
  const exercise = resolveExercise(exerciseCatalog, id);
  if (!exercise) return <Screen edges={['left', 'right', 'bottom']} testID="exercise-missing" contentContainerStyle={styles.content}>
    <AppText variant="sectionTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{copy.missing}</AppText>
    <Button label={copy.backCatalog} variant="secondary" maxFontSizeMultiplier={t.accessibility.controlTextScale} onPress={() => router.dismissTo('/exercises')} testID="exercise-missing-back" />
  </Screen>;
  const view = presentExercise(exercise, locale);
  return <Screen scroll edges={['left', 'right', 'bottom']} contentContainerStyle={styles.content} testID="exercise-detail-screen">
    <AppText variant="pageTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale} testID="exercise-detail-name">{view.name}</AppText>
    <View style={styles.visual} testID="exercise-visual">
      <View style={styles.symbol}><Icon name="workouts" size="large" color={t.colors.primaryText} /></View>
      <AppText variant="caption" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.visual}</AppText>
    </View>
    <Card><View style={styles.section}>
      <View style={styles.field} testID="exercise-primary-muscles">
        <AppText variant="label" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.primary}</AppText>
        <View style={styles.badges}>{view.primaryMuscles.map(label => <Badge key={label} label={label} tone="accent" />)}</View>
      </View>
      {view.secondaryMuscles.length > 0 && <View style={styles.field} testID="exercise-secondary-muscles">
        <AppText variant="label" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.secondary}</AppText>
        <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{view.secondaryMuscles.join(' · ')}</AppText>
      </View>}
      <View style={styles.field} testID="exercise-equipment">
        <AppText variant="label" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.equipment}</AppText>
        <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{view.equipment.join(' · ')}</AppText>
      </View>
      <View style={styles.field} testID="exercise-tracking">
        <AppText variant="label" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.tracking}</AppText>
        <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{view.tracking}</AppText>
      </View>
    </View></Card>
    <View style={styles.section} testID="exercise-instructions">
      <AppText variant="sectionTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{copy.instructions}</AppText>
      {view.instructions.map((step, index) => <View key={index} style={styles.step} testID={`exercise-step-${index + 1}`} accessible accessibilityLabel={`${index + 1}. ${step}`}>
        <AppText variant="label" tone="primaryText" maxFontSizeMultiplier={t.accessibility.controlTextScale}>{index + 1}.</AppText>
        <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} style={styles.flex}>{step}</AppText>
      </View>)}
    </View>
    {view.tips.length > 0 && <Card testID="exercise-tips"><View style={styles.section}>
      <AppText variant="cardTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{copy.tips}</AppText>
      {view.tips.map(tip => <AppText key={tip} tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{tip}</AppText>)}
    </View></Card>}
  </Screen>;
}
const styles = StyleSheet.create({
  content: { gap: t.spacing.xl, paddingTop: t.spacing.lg }, section: { gap: t.spacing.lg }, field: { gap: t.spacing.xs }, flex: { flex: 1 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  visual: { backgroundColor: t.colors.surfaceSecondary, borderRadius: t.radii.card, padding: t.spacing.xxl, alignItems: 'center', justifyContent: 'center', gap: t.spacing.sm },
  symbol: { width: t.size.floatingControl, height: t.size.floatingControl, borderRadius: t.radii.pill, backgroundColor: t.colors.surface, alignItems: 'center', justifyContent: 'center' },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.md },
});
