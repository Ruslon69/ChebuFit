import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Keyboard, Modal, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { personalFoodService } from '../../../application/personal-foods/personalFoods';
import { deletePersonalCatalogFood } from '../../../application/food-catalog/catalog';
import { useRewardFeedback } from '../../../application/rewards/RewardFeedbackProvider';
import type { BarcodeContext } from '../../food-catalog/application/BarcodeLookupController';
import { FoodSelectionSheet } from '../../food-catalog/ui/FoodSelectionSheet';
import { personalFoodToCatalog, type PersonalFood } from '../domain/personalFood';
import { personalFoodDraft, personalFoodFields, validatePersonalFoodDraft, type PersonalFoodField, type PersonalFoodFormErrors } from '../model/form';
import { getPersonalFoodMessages } from '../model/messages';
import { getNutritionMessages, nutritionFormatters } from '../../nutrition/model/messages';
import { appConfig } from '../../../shared/config/app';
import { getLocalDateKey } from '../../../shared/utils/localCalendar';
import { tokens as t } from '../../../shared/theme/tokens';
import { Screen } from '../../../shared/ui/Screen';
import { Card } from '../../../shared/ui/Card';
import { AppText } from '../../../shared/ui/AppText';
import { Button } from '../../../shared/ui/Button';

export function PersonalFoodScreen({ context, id, barcode }: { context: BarcodeContext; id?: string; barcode?: string }) {
  const router = useRouter(), feedback = useRewardFeedback(), insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const locale = appConfig.defaultLocale, copy = getPersonalFoodMessages(locale), nutritionCopy = getNutritionMessages(locale), format = nutritionFormatters(locale);
  const [draft, setDraft] = useState(() => personalFoodDraft(undefined, barcode));
  const [errors, setErrors] = useState<PersonalFoodFormErrors>({}), [loading, setLoading] = useState(!!id), [loadError, setLoadError] = useState(false), [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false), [failed, setFailed] = useState(false), [confirm, setConfirm] = useState(false), [deleteFailed, setDeleteFailed] = useState(false);
  const [selection, setSelection] = useState<PersonalFood | null>(null), [duplicate, setDuplicate] = useState<PersonalFood | null>(null), [revision, setRevision] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const lock = useRef(false), mounted = useRef(true), inputs = useRef<Partial<Record<PersonalFoodField, ComponentRef<typeof TextInput> | null>>>({});
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!id) return;
    let active = true; setLoading(true); setLoadError(false);
    void personalFoodService.getById(id).then(result => {
      if (!active) return; setLoading(false);
      if (!result.ok) setLoadError(true);
      else if (!result.value) setMissing(true);
      else { setMissing(false); setDraft(personalFoodDraft(result.value)); }
    });
    return () => { active = false; };
  }, [id, revision]);
  const backToSearch = () => router.dismissTo({ pathname: '/add-food', params: context });
  const save = async () => {
    if (lock.current) return;
    const valid = validatePersonalFoodDraft(draft);
    if (!valid.ok) { setErrors(valid.errors); inputs.current[personalFoodFields.find(key => valid.errors[key])!]?.focus(); return; }
    lock.current = true; setBusy(true); setFailed(false); setDuplicate(null); setErrors({}); Keyboard.dismiss();
    const result = id ? await personalFoodService.update(id, valid.value) : await personalFoodService.create(valid.value);
    if (mounted.current) {
      if (result.ok) { if (id) { if (router.canGoBack()) router.back(); else backToSearch(); } else setSelection(result.value); }
      else if (result.error === 'duplicateBarcode' && result.existing) setDuplicate(result.existing);
      else setFailed(true);
      setBusy(false);
    }
    // A committed create stays locked until this route leaves, including the native modal transition.
    if (!result.ok) lock.current = false;
  };
  const remove = async () => {
    if (!id || lock.current) return;
    lock.current = true; setBusy(true); setDeleteFailed(false);
    const result = await deletePersonalCatalogFood(id);
    if (mounted.current) { if (result.ok) { setConfirm(false); router.back(); } else setDeleteFailed(true); setBusy(false); }
    lock.current = false;
  };
  const field = (key: PersonalFoodField, label: string, unit?: string) => <View key={key} style={[styles.field, ['energy', 'protein', 'fat', 'carbs'].includes(key) && styles.nutrientField, fontScale > 1.3 && styles.expandedField]}>
    <AppText variant="label" maxFontSizeMultiplier={t.accessibility.bodyTextScale} nativeID={`personal-label-${key}`}>{label}</AppText>
    <View style={[styles.inputRow, errors[key] && styles.invalid]}>
      <TextInput ref={value => { inputs.current[key] = value; }} value={draft[key]} editable={!busy}
        onChangeText={value => { setDraft(previous => ({ ...previous, [key]: value })); setErrors(previous => ({ ...previous, [key]: undefined })); setDuplicate(null); }}
        style={styles.input} maxLength={key === 'name' ? 200 : key === 'brand' ? 120 : key === 'barcode' ? 32 : 16}
        keyboardType={key === 'name' || key === 'brand' ? 'default' : key === 'barcode' ? 'number-pad' : 'decimal-pad'}
        autoCorrect={false} autoCapitalize={key === 'name' || key === 'brand' ? 'sentences' : 'none'}
        accessibilityLabel={`${label}${unit ? `, ${unit}` : ''}${errors[key] ? `. ${copy.errors[key]}` : ''}`}
        onFocus={() => setKeyboardOpen(true)} onBlur={() => setKeyboardOpen(false)}
        returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} maxFontSizeMultiplier={t.accessibility.controlTextScale} testID={`personal-input-${key}`} />
      {unit && <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{unit}</AppText>}
    </View>
    {errors[key] && <AppText tone="destructive" variant="bodySecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale} accessibilityLiveRegion="polite" testID={`personal-error-${key}`}>{copy.errors[key]}</AppText>}
  </View>;
  return <>
    <Stack.Screen options={{ headerRight: () => keyboardOpen ? <Pressable accessibilityRole="button" onPress={() => Keyboard.dismiss()} style={styles.done} testID="personal-keyboard-done"><AppText tone="primaryText" variant="label" maxFontSizeMultiplier={t.accessibility.controlTextScale}>{copy.done}</AppText></Pressable> : null }} />
    <Screen scroll keyboardAware edges={['left', 'right', 'bottom']} contentContainerStyle={styles.content} testID="personal-food-screen">
      <AppText variant="label" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale} testID="personal-food-context">{nutritionCopy.meals[context.meal]} · {format.date(context.date, getLocalDateKey(new Date()))}</AppText>
      {loading ? <ActivityIndicator color={t.colors.primaryText} accessibilityLabel={copy.loading} /> : loadError || missing ? <Card><View style={styles.section}>
        <AppText>{missing ? copy.missing : copy.loadFailed}</AppText>
        {loadError && <Button label={copy.retry} onPress={() => setRevision(value => value + 1)} />}
        <Button label={copy.back} variant="ghost" onPress={backToSearch} />
      </View></Card> : <>
        <Card padding="compact"><View style={styles.section}>{field('name', copy.name)}{field('brand', copy.brand)}</View></Card>
        <Card padding="compact"><View style={styles.section}>
          <AppText variant="cardTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{copy.basis}</AppText>
          <View style={styles.macroFields}>{field('energy', copy.energy, copy.kcal)}{field('protein', copy.protein, copy.grams)}{field('fat', copy.fat, copy.grams)}{field('carbs', copy.carbs, copy.grams)}</View>
        </View></Card>
        <Card padding="compact">{field('barcode', copy.barcode)}</Card>
        {duplicate && <Card testID="personal-food-duplicate"><View style={styles.section} accessibilityLiveRegion="polite">
          <AppText>{copy.duplicate}</AppText><AppText variant="cardTitle">{duplicate.name}</AppText>
          <Button label={copy.use} variant="secondary" onPress={() => setSelection(duplicate)} testID="personal-duplicate-use" />
          <Button label={copy.edit} variant="ghost" onPress={() => router.replace({ pathname: '/personal-food', params: { ...context, id: duplicate.id } })} testID="personal-duplicate-edit" />
        </View></Card>}
        {failed && <AppText tone="destructive" accessibilityLiveRegion="polite" maxFontSizeMultiplier={t.accessibility.bodyTextScale} testID="personal-save-error">{copy.failed}</AppText>}
        <Button label={id ? copy.save : copy.saveAdd} loading={busy} onPress={() => void save()} maxFontSizeMultiplier={t.accessibility.controlTextScale} testID="personal-food-save" />
        {id && <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => { Keyboard.dismiss(); setConfirm(true); }} style={styles.delete} testID="personal-food-delete">
          <AppText tone="textSecondary" variant="bodySecondary" maxFontSizeMultiplier={t.accessibility.controlTextScale}>{copy.delete}</AppText>
        </Pressable>}
      </>}
    </Screen>
    <Modal visible={confirm} transparent animationType="fade" onRequestClose={() => { if (!busy) setConfirm(false); }}>
      <View style={[styles.overlay, { paddingTop: insets.top + t.spacing.lg, paddingBottom: insets.bottom + t.spacing.lg, paddingLeft: insets.left + t.spacing.lg, paddingRight: insets.right + t.spacing.lg }]}>
        <Card testID="personal-delete-confirmation" style={styles.confirmation}><ScrollView accessibilityViewIsModal contentContainerStyle={styles.section}>
          <AppText variant="sectionTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{copy.deleteTitle}</AppText>
          <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.deleteHint}</AppText>
          {deleteFailed && <AppText tone="destructive" accessibilityLiveRegion="polite">{copy.deleteFailed}</AppText>}
          <Button label={copy.confirmDelete} variant="destructive" loading={busy} onPress={() => void remove()} testID="personal-delete-confirm" maxFontSizeMultiplier={t.accessibility.controlTextScale} />
          <Button label={copy.cancel} variant="ghost" disabled={busy} onPress={() => setConfirm(false)} testID="personal-delete-cancel" maxFontSizeMultiplier={t.accessibility.controlTextScale} />
        </ScrollView></Card>
      </View>
    </Modal>
    {selection && <FoodSelectionSheet food={personalFoodToCatalog(selection)} date={context.date} initialMeal={context.meal} onClose={backToSearch}
      onAdded={notice => { router.dismissTo('/nutrition'); feedback.show(notice); }} />}
  </>;
}
const styles = StyleSheet.create({
  content: { gap: t.spacing.lg }, section: { gap: t.spacing.md }, field: { gap: t.spacing.sm }, nutrientField: { flexGrow: 1, width: '45%', minWidth: t.size.touchTarget + t.spacing.xl },
  expandedField: { flexBasis: 'auto', width: '100%' }, confirmation: { maxHeight: t.layout.modalMaxHeight },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, backgroundColor: t.colors.surfaceSecondary, borderRadius: t.radii.control, paddingHorizontal: t.spacing.md, borderWidth: t.stroke.thin, borderColor: t.colors.surfaceSecondary },
  invalid: { borderColor: t.colors.destructive }, input: { ...t.typography.body, color: t.colors.text, minHeight: t.size.button, paddingVertical: t.spacing.md, flex: 1 },
  macroFields: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md },
  delete: { minHeight: t.size.touchTarget, justifyContent: 'center', alignItems: 'center' },
  done: { minHeight: t.size.touchTarget, justifyContent: 'center', paddingHorizontal: t.spacing.lg },
  overlay: { flex: 1, backgroundColor: t.colors.scrim, justifyContent: 'center' },
});
