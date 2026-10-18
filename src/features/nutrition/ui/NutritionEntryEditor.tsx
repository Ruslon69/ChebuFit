import { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MealType, NutritionDiaryEntry } from '../domain/types';
import { mealTypes } from '../domain/types';
import { parseQuantityDraft } from '../model/diaryPresentation';
import type { NutritionCopy } from '../model/messages';
import { AppText } from '../../../shared/ui/AppText';
import { Button } from '../../../shared/ui/Button';
import { IconButton } from '../../../shared/ui/IconButton';
import { tokens as t } from '../../../shared/theme/tokens';

type Props = { entry: NutritionDiaryEntry; copy: NutritionCopy; onClose: () => void;
  onSave: (grams: number, meal: MealType) => Promise<boolean>; onDelete: () => Promise<boolean> };
export function NutritionEntryEditor({ entry, copy, onClose, onSave, onDelete }: Props) {
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [draft, setDraft] = useState(String(entry.quantity.milliGrams / 1000).replace('.', ','));
  const [meal, setMeal] = useState(entry.meal), [busy, setBusy] = useState(false), [confirm, setConfirm] = useState(false), [failed, setFailed] = useState(false);
  const committing = useRef(false), grams = parseQuantityDraft(draft);
  const commit = async (deleting: boolean) => {
    if (committing.current || (!deleting && grams === null)) return;
    committing.current = true; setBusy(true); setFailed(false); Keyboard.dismiss();
    try { const success = deleting ? await onDelete() : grams !== null && await onSave(grams, meal); if (success) onClose(); else setFailed(true); }
    catch { setFailed(true); }
    finally { committing.current = false; setBusy(false); }
  };
  const close = () => { if (!committing.current) { Keyboard.dismiss(); onClose(); } };
  return (
    <Modal transparent animationType="fade" onRequestClose={close} testID="nutrition-editor-modal">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessible={false} />
        <View
          accessibilityViewIsModal testID="nutrition-editor"
          style={[styles.sheet, {
            marginLeft: insets.left + t.spacing.lg, marginRight: insets.right + t.spacing.lg,
            marginTop: insets.top + t.spacing.lg, marginBottom: Math.max(insets.bottom, t.spacing.lg),
          }]}
        >
          <View style={styles.header}>
            <AppText maxFontSizeMultiplier={t.accessibility.headingTextScale} variant="cardTitle" style={styles.flex}>
              {confirm ? copy.confirmDelete : copy.editor}
            </AppText>
            <IconButton icon="close" variant="ghost" label={copy.close} onPress={close} disabled={busy} testID="nutrition-editor-close" />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" contentContainerStyle={styles.body}>
            <View>
              <AppText maxFontSizeMultiplier={t.accessibility.headingTextScale} variant="sectionTitle">{entry.food.name}</AppText>
              {entry.food.brand && <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="bodySecondary" tone="textSecondary">{entry.food.brand}</AppText>}
            </View>
            {!confirm && (
              <>
                <View style={styles.field}>
                  <View style={styles.quantityHeader}>
                    <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="label" nativeID="nutrition-quantity-label">{copy.quantity}</AppText>
                    {keyboardOpen && (
                      <Pressable testID="nutrition-keyboard-done" accessibilityRole="button" onPress={() => Keyboard.dismiss()} style={styles.done}>
                        <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="label" tone="primaryText">{copy.done}</AppText>
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.inputRow}>
                    <TextInput
                      testID="nutrition-quantity" accessibilityLabel={`${copy.quantity}, ${copy.grams}`}
                      maxFontSizeMultiplier={t.accessibility.controlTextScale} value={draft} onChangeText={setDraft} editable={!busy}
                      keyboardType="decimal-pad" returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()}
                      onFocus={() => setKeyboardOpen(true)} onBlur={() => setKeyboardOpen(false)} selectTextOnFocus maxLength={14} style={styles.input}
                    />
                    <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} tone="textSecondary">{copy.grams}</AppText>
                  </View>
                  {grams === null && (
                    <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="bodySecondary" tone="destructive" accessibilityLiveRegion="polite">{copy.invalidQuantity}</AppText>
                  )}
                </View>
                <View style={styles.field}>
                  <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="label">{copy.meal}</AppText>
                  <View style={styles.meals}>
                    {mealTypes.map(value => (
                      <Pressable
                        key={value} testID={`nutrition-select-${value}`} accessibilityRole="radio"
                        accessibilityState={{ checked: meal === value, disabled: busy }} disabled={busy} onPress={() => setMeal(value)}
                        style={({ pressed }) => [styles.meal, meal === value && styles.selected, pressed && { opacity: t.opacity.pressed }]}
                      >
                        <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="label" tone={meal === value ? 'primaryText' : 'textSecondary'} align="center">{copy.meals[value]}</AppText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </>
            )}
            {failed && (
              <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} tone="destructive" variant="bodySecondary" accessibilityLiveRegion="polite">{copy.saveError}</AppText>
            )}
            {!confirm && (
              <Pressable
                testID="nutrition-delete" accessibilityRole="button" disabled={busy} accessibilityState={{ disabled: busy }}
                onPress={() => { Keyboard.dismiss(); setConfirm(true); }} style={styles.delete}
              >
                <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale} variant="label" tone="destructive">{copy.delete}</AppText>
              </Pressable>
            )}
          </ScrollView>
          <View style={styles.footer}>
            {confirm ? (
              <>
                <Button maxFontSizeMultiplier={t.accessibility.controlTextScale} label={copy.deleteAction} variant="destructive" loading={busy} onPress={() => void commit(true)} testID="nutrition-delete-confirm" />
                <Button maxFontSizeMultiplier={t.accessibility.controlTextScale} label={copy.cancel} variant="ghost" disabled={busy} onPress={() => setConfirm(false)} testID="nutrition-delete-cancel" />
              </>
            ) : (
              <Button maxFontSizeMultiplier={t.accessibility.controlTextScale} label={copy.save} loading={busy} disabled={grams === null} onPress={() => void commit(false)} testID="nutrition-save" />
            )}
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
  body: { gap: t.spacing.xl, paddingBottom: t.spacing.xs }, field: { gap: t.spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, backgroundColor: t.colors.surfaceSecondary, borderRadius: t.radii.control, paddingHorizontal: t.spacing.lg },
  input: { ...t.typography.cardTitle, color: t.colors.text, flex: 1, minHeight: t.size.button, paddingVertical: t.spacing.md },
  meals: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
  meal: { flexGrow: 1, flexBasis: '45%', minHeight: t.size.touchTarget, justifyContent: 'center', padding: t.spacing.sm, borderRadius: t.radii.control, backgroundColor: t.colors.surfaceSecondary }, selected: { backgroundColor: t.colors.primarySubtle },
  delete: { minHeight: t.size.touchTarget, alignItems: 'center', justifyContent: 'center', paddingVertical: t.spacing.sm },
  footer: { gap: t.spacing.sm, paddingTop: t.spacing.lg },
  quantityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  done: { minHeight: t.size.touchTarget, minWidth: t.size.touchTarget, justifyContent: 'center', alignItems: 'flex-end' },
});
