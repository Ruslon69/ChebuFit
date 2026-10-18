import { useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createCatalogFoodAdd } from '../../../application/food-catalog/catalog';
import { createLocalRewardContext } from '../../../application/rewards/localRewardContext';
import type { OrangeRewardNotice } from '../../rewards';
import { mealTypes, type LocalDateKey, type MealType } from '../../nutrition';
import { parseQuantityDraft } from '../../nutrition/model/diaryPresentation';
import { getNutritionMessages, nutritionFormatters } from '../../nutrition/model/messages';
import { appConfig } from '../../../shared/config/app';
import { getLocalDateKey } from '../../../shared/utils/localCalendar';
import { tokens as t } from '../../../shared/theme/tokens';
import { AppText } from '../../../shared/ui/AppText';
import { Button } from '../../../shared/ui/Button';
import { IconButton } from '../../../shared/ui/IconButton';
import { previewCatalogFood } from '../domain/catalogFood';
import type { CatalogFood } from '../domain/types';
import { foodNutrientLine, getFoodCatalogMessages } from '../model/messages';
import { personalFoodProviderId } from '../../personal-foods/domain/personalFood';
import { getPersonalFoodMessages } from '../../personal-foods/model/messages';

type Props = { food: CatalogFood; date: LocalDateKey; initialMeal: MealType; onClose: () => void; onAdded: (notice: OrangeRewardNotice | null) => void };
export function FoodSelectionSheet({ food, date, initialMeal, onClose, onAdded }: Props) {
  const locale = appConfig.defaultLocale, copy = getFoodCatalogMessages(locale), nutritionCopy = getNutritionMessages(locale), format = nutritionFormatters(locale);
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('100'), [meal, setMeal] = useState(initialMeal);
  const [busy, setBusy] = useState(false), [failed, setFailed] = useState(false), [focused, setFocused] = useState(false), [visible, setVisible] = useState(true);
  const [operation] = useState(createCatalogFoodAdd);
  const committing = useRef(false), completed = useRef<{ notice: OrangeRewardNotice | null } | null>(null), delivered = useRef(false);
  const grams = parseQuantityDraft(draft);
  const preview = useMemo(() => grams === null ? null : previewCatalogFood(food, grams), [food, grams]);
  const finish = () => { if (completed.current && !delivered.current) { delivered.current = true; onAdded(completed.current.notice); } };
  const close = () => { if (!committing.current) { Keyboard.dismiss(); onClose(); } };
  const add = async () => {
    if (committing.current || grams === null || !preview?.ok) return;
    committing.current = true; setBusy(true); setFailed(false); Keyboard.dismiss();
    const result = await operation.submit({ food, localDate: date, meal, quantityGrams: grams, rewardContext: createLocalRewardContext(new Date()) });
    if (!result.ok) { committing.current = false; setBusy(false); setFailed(true); return; }
    if (__DEV__ && result.value.rewardFailed) console.warn('[Food Add] Entry saved; reward persistence failed.');
    if (__DEV__ && !result.value.recentSaved) console.warn('[Food Add] Entry saved; recent food could not be recorded.');
    completed.current = { notice: result.value.notice }; setVisible(false);
    if (Platform.OS !== 'ios') finish();
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} onDismiss={finish}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessible={false} />
        <View testID="food-selection" accessibilityViewIsModal style={[styles.sheet, {
          marginLeft: insets.left + t.spacing.lg, marginRight: insets.right + t.spacing.lg,
          marginTop: insets.top + t.spacing.lg, marginBottom: Math.max(insets.bottom, t.spacing.lg),
        }]}>
          <View style={styles.header}>
            <View style={styles.flex}>
              <AppText variant="sectionTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale} numberOfLines={focused ? 1 : undefined} testID="food-selection-name">{food.name}</AppText>
              {!focused && food.brand && <AppText variant="bodySecondary" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{food.brand}</AppText>}
            </View>
            {focused ? <Pressable accessibilityRole="button" onPress={() => Keyboard.dismiss()} style={styles.done} testID="food-quantity-done"><AppText variant="label" tone="primaryText" maxFontSizeMultiplier={t.accessibility.controlTextScale}>{copy.done}</AppText></Pressable>
              : <IconButton icon="close" label={copy.close} variant="ghost" disabled={busy} onPress={close} testID="food-selection-close" />}
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" contentContainerStyle={styles.body}>
            {!focused && <View style={styles.field}>
              <AppText variant="caption" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{food.source.providerId === personalFoodProviderId ? `${getPersonalFoodMessages(locale).badge} · ${copy.per100}` : copy.per100}</AppText>
              <AppText variant="bodySecondary" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{foodNutrientLine(food.nutrients, locale)}</AppText>
            </View>}
            <View style={styles.field}>
              {!focused && <AppText variant="label" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.quantity}</AppText>}
              <View style={styles.inputRow}>
                <TextInput value={draft} onChangeText={setDraft} keyboardType="decimal-pad" returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} editable={!busy} selectTextOnFocus maxLength={14}
                  accessibilityLabel={`${copy.quantity}, ${copy.grams}`} maxFontSizeMultiplier={t.accessibility.controlTextScale} style={styles.input} testID="food-quantity" />
                <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.grams}</AppText>
              </View>
              {(!preview || !preview.ok) && <AppText variant="bodySecondary" tone="destructive" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.invalidQuantity}</AppText>}
            </View>
            {!focused && preview?.ok && <View style={styles.preview} testID="food-preview" accessible accessibilityLabel={`${copy.portion}. ${foodNutrientLine(preview.value, locale)}`}>
              <AppText variant="caption" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.portion}</AppText>
              <AppText variant="sectionTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale} testID="food-preview-calories">{format.number(preview.value.energyCentiKcal / 100)} {copy.kcal}</AppText>
              <View style={styles.macros}>{(['proteinMg', 'fatMg', 'carbsMg'] as const).map((key, index) => <View key={key} style={styles.macro}>
                <AppText variant="caption" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{[copy.protein, copy.fat, copy.carbs][index]}</AppText>
                <AppText variant="label" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{format.number(preview.value[key] / 1000, 1)} {copy.grams}</AppText>
              </View>)}</View>
            </View>}
            {!focused && <View style={styles.field}>
              <AppText variant="label" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.meal}</AppText>
              <AppText variant="bodySecondary" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale} testID="food-selection-date">{format.date(date, getLocalDateKey(new Date()))}</AppText>
              <View style={styles.meals}>{mealTypes.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: meal === value, disabled: busy }} disabled={busy}
                onPress={() => setMeal(value)} style={({ pressed }) => [styles.meal, value === meal && styles.selected, pressed && { opacity: t.opacity.pressed }]} testID={`food-meal-${value}`}>
                <AppText variant="label" align="center" tone={value === meal ? 'primaryText' : 'textSecondary'} maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{nutritionCopy.meals[value]}</AppText>
              </Pressable>)}</View>
            </View>}
            {failed && <AppText variant="bodySecondary" tone="destructive" accessibilityLiveRegion="polite" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.saveError}</AppText>}
          </ScrollView>
          <View style={styles.footer}>
            {focused && preview?.ok && <AppText variant="label" maxFontSizeMultiplier={t.accessibility.headingTextScale} testID="food-preview-calories" accessibilityLabel={`${copy.portion}. ${foodNutrientLine(preview.value, locale)}`}>{foodNutrientLine(preview.value, locale)}</AppText>}
            <Button label={focused ? copy.addShort : copy.add} accessibilityLabel={`${copy.add}, ${nutritionCopy.meals[meal]}, ${format.date(date, getLocalDateKey(new Date()))}`} disabled={!preview?.ok} loading={busy} onPress={() => void add()} maxFontSizeMultiplier={t.accessibility.controlTextScale} testID="food-add-confirm" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: t.colors.scrim },
  sheet: { flexShrink: 1, backgroundColor: t.colors.surface, borderRadius: t.radii.card, maxHeight: t.layout.modalMaxHeight, maxWidth: t.layout.contentMaxWidth, padding: t.spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, marginBottom: t.spacing.lg }, flex: { flex: 1 },
  body: { gap: t.spacing.lg, paddingBottom: t.spacing.xs }, field: { gap: t.spacing.sm },
  done: { minHeight: t.size.touchTarget, minWidth: t.size.touchTarget, justifyContent: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, backgroundColor: t.colors.surfaceSecondary, borderRadius: t.radii.control, paddingHorizontal: t.spacing.lg },
  input: { ...t.typography.cardTitle, color: t.colors.text, flex: 1, minHeight: t.size.button, paddingVertical: t.spacing.md },
  preview: { gap: t.spacing.sm }, macros: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.lg }, macro: { flexGrow: 1, minWidth: t.size.touchTarget + t.spacing.xl, gap: t.spacing.xs },
  meals: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }, meal: { flexGrow: 1, flexBasis: '45%', minHeight: t.size.touchTarget, justifyContent: 'center', padding: t.spacing.sm, borderRadius: t.radii.control, backgroundColor: t.colors.surfaceSecondary },
  selected: { backgroundColor: t.colors.primarySubtle }, footer: { paddingTop: t.spacing.lg, gap: t.spacing.sm },
});
