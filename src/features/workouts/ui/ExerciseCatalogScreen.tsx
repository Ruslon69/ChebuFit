import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Keyboard, Modal, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { exerciseCatalog } from '../../../application/workouts/exerciseCatalog';
import { appConfig } from '../../../shared/config/app';
import { tokens as t } from '../../../shared/theme/tokens';
import { AppText } from '../../../shared/ui/AppText';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { IconButton } from '../../../shared/ui/IconButton';
import { Screen } from '../../../shared/ui/Screen';
import { equipmentTypes, muscles, type Equipment, type Muscle } from '../domain/exercise';
import { exerciseRoute, presentExercise } from '../model/exercisePresentation';
import { getExerciseMessages } from '../model/messages';

export function ExerciseCatalogScreen() {
  const locale = appConfig.defaultLocale, copy = getExerciseMessages(locale), router = useRouter();
  const [query, setQuery] = useState(''), [muscle, setMuscle] = useState<Muscle>(), [equipment, setEquipment] = useState<Equipment>();
  const [filter, setFilter] = useState<'muscle' | 'equipment' | null>(null);
  const { fontScale } = useWindowDimensions(), insets = useSafeAreaInsets();
  const results = useMemo(() => exerciseCatalog.search({ text: query, muscle, equipment }).map(exercise => presentExercise(exercise, locale)), [query, muscle, equipment, locale]);
  const availableEquipment = useMemo(() => equipmentTypes.filter(item => exerciseCatalog.getAll().some(exercise => exercise.equipment.includes(item))), []);
  const resetFilters = () => { setMuscle(undefined); setEquipment(undefined); };
  const openFilter = (value: typeof filter) => { Keyboard.dismiss(); setFilter(value); };
  const option = (id: string, label: string, selected: boolean, onPress: () => void) => (
    <Pressable key={id} accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]} testID={`exercise-option-${id}`}>
      <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} style={styles.flex} tone={selected ? 'primaryText' : 'text'}>{label}</AppText>
      {selected && <Icon name="check" color={t.colors.primaryText} />}
    </Pressable>
  );
  return <>
    <Screen scroll keyboardAware edges={['left', 'right', 'bottom']} contentContainerStyle={styles.content} testID="exercise-catalog-screen">
      <View style={styles.search}>
        <Icon name="search" />
        <TextInput value={query} onChangeText={setQuery} placeholder={copy.search} placeholderTextColor={t.colors.textTertiary} accessibilityLabel={copy.search}
          autoCorrect={false} autoCapitalize="none" returnKeyType="search" onSubmitEditing={() => Keyboard.dismiss()} maxLength={120}
          maxFontSizeMultiplier={t.accessibility.controlTextScale} style={styles.input} testID="exercise-search-input" />
        {!!query && <IconButton icon="close" variant="ghost" label={copy.clearSearch} onPress={() => setQuery('')} testID="exercise-search-clear" />}
      </View>
      <View style={[styles.filters, fontScale > 1.3 && styles.stacked]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${copy.muscle}: ${muscle ? copy.muscles[muscle] : copy.allMuscles}`} accessibilityState={{ selected: !!muscle }} onPress={() => openFilter('muscle')}
          style={({ pressed }) => [styles.filter, !!muscle && styles.selected, pressed && styles.pressed]} testID="exercise-filter-muscle">
          <AppText variant="label" tone={muscle ? 'primaryText' : 'textSecondary'} maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{muscle ? copy.muscles[muscle] : copy.muscle}</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`${copy.equipment}: ${equipment ? copy.equipmentLabels[equipment] : copy.allEquipment}`} accessibilityState={{ selected: !!equipment }} onPress={() => openFilter('equipment')}
          style={({ pressed }) => [styles.filter, !!equipment && styles.selected, pressed && styles.pressed]} testID="exercise-filter-equipment">
          <AppText variant="label" tone={equipment ? 'primaryText' : 'textSecondary'} maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{equipment ? copy.equipmentLabels[equipment] : copy.equipment}</AppText>
        </Pressable>
      </View>
      <View style={styles.context}>
        <AppText variant="bodySecondary" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale} accessibilityLiveRegion="polite" testID="exercise-result-count">{copy.found}: {results.length}</AppText>
        {(muscle || equipment) && <Pressable accessibilityRole="button" onPress={resetFilters} style={styles.reset} testID="exercise-filter-reset"><AppText variant="bodySecondary" tone="primaryText" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.resetFilters}</AppText></Pressable>}
      </View>
      {results.length ? <Card padding="compact" testID="exercise-results">{results.map(exercise => <Pressable key={exercise.id}
        accessibilityRole="button" accessibilityLabel={`${exercise.name}. ${exercise.primaryMuscles.join(', ')}. ${exercise.equipment.join(', ')}`} accessibilityHint={copy.openExercise}
        onPress={() => { Keyboard.dismiss(); router.push(exerciseRoute(exercise.id)); }} testID={`exercise-row-${exercise.id}`} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={styles.thumbnail}><Icon name="workouts" /></View>
        <View style={styles.rowCopy}>
          <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{exercise.name}</AppText>
          <AppText variant="bodySecondary" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{exercise.primaryMuscles.join(' · ')}</AppText>
          <AppText variant="caption" tone="textTertiary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{exercise.equipment.join(' · ')}</AppText>
        </View>
        <Icon name="chevron" size="small" />
      </Pressable>)}</Card> : <Card testID="exercise-empty"><View style={styles.section}>
        <AppText variant="cardTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{copy.empty}</AppText>
        <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.emptyHint}</AppText>
        {(query || muscle || equipment) && <Button label={copy.resetAll} variant="secondary" maxFontSizeMultiplier={t.accessibility.controlTextScale} onPress={() => { setQuery(''); resetFilters(); }} testID="exercise-reset-all" />}
      </View></Card>}
    </Screen>
    <Modal visible={filter !== null} transparent animationType="fade" onRequestClose={() => setFilter(null)}>
      <View style={[styles.overlay, { paddingTop: insets.top + t.spacing.lg, paddingBottom: insets.bottom + t.spacing.lg, paddingLeft: insets.left + t.spacing.lg, paddingRight: insets.right + t.spacing.lg }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setFilter(null)} accessible={false} />
        <View style={styles.sheet} accessibilityViewIsModal testID="exercise-filter-sheet">
          <View style={styles.header}>
            <AppText variant="sectionTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale} style={styles.flex}>{filter === 'muscle' ? copy.muscle : copy.equipment}</AppText>
            <IconButton icon="close" variant="ghost" label={copy.close} onPress={() => setFilter(null)} testID="exercise-filter-close" />
          </View>
          {filter === 'muscle' && <AppText variant="bodySecondary" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.muscleHint}</AppText>}
          <ScrollView contentContainerStyle={styles.options}>
            {filter === 'muscle' ? <>
              {option('all-muscles', copy.allMuscles, !muscle, () => { setMuscle(undefined); setFilter(null); })}
              {muscles.map(value => option(value, copy.muscles[value], muscle === value, () => { setMuscle(value); setFilter(null); }))}
            </> : <>
              {option('all-equipment', copy.allEquipment, !equipment, () => { setEquipment(undefined); setFilter(null); })}
              {availableEquipment.map(value => option(value, copy.equipmentLabels[value], equipment === value, () => { setEquipment(value); setFilter(null); }))}
            </>}
          </ScrollView>
        </View>
      </View>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  content: { gap: t.spacing.md, paddingTop: t.spacing.lg }, flex: { flex: 1 }, section: { gap: t.spacing.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, backgroundColor: t.colors.surface, borderRadius: t.radii.control, paddingLeft: t.spacing.lg, paddingRight: t.spacing.xs },
  input: { ...t.typography.body, color: t.colors.text, flex: 1, minHeight: t.size.button, paddingVertical: t.spacing.md },
  filters: { flexDirection: 'row', gap: t.spacing.sm }, stacked: { flexDirection: 'column' },
  filter: { flex: 1, minHeight: t.size.touchTarget, padding: t.spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: t.radii.control, backgroundColor: t.colors.surfaceSecondary },
  selected: { backgroundColor: t.colors.primarySubtle }, pressed: { opacity: t.opacity.pressed },
  context: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: t.spacing.sm },
  reset: { minHeight: t.size.touchTarget, justifyContent: 'center' },
  row: { minHeight: t.size.button, flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.sm, borderBottomWidth: t.stroke.thin, borderBottomColor: t.colors.divider },
  rowCopy: { flex: 1, minWidth: 0 }, thumbnail: { width: t.size.touchTarget, height: t.size.touchTarget, borderRadius: t.radii.control, backgroundColor: t.colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: t.colors.scrim },
  sheet: { flexShrink: 1, backgroundColor: t.colors.surface, borderRadius: t.radii.card, padding: t.spacing.lg, maxHeight: t.layout.modalMaxHeight, gap: t.spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }, options: { gap: t.spacing.xs },
  option: { minHeight: t.size.touchTarget, flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, padding: t.spacing.md, borderRadius: t.radii.control },
});
