import { useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMessages } from '../../shared/i18n/useMessages';
import { tokens } from '../../shared/theme/tokens';
import { AppText } from '../../shared/ui/AppText';
import { Icon, type IconName } from '../../shared/ui/Icon';
import { IconButton } from '../../shared/ui/IconButton';

const actions = [
  { id: 'food', icon: 'nutrition' },
  { id: 'barcode', icon: 'barcode' },
  { id: 'water', icon: 'water' },
  { id: 'workout', icon: 'workouts' },
  { id: 'weight', icon: 'weight' },
  { id: 'measurement', icon: 'measurement' },
] as const satisfies ReadonlyArray<{ id: keyof ReturnType<typeof useMessages>['quickAdd']['actions']; icon: IconName }>;

// Application-level UI: shared by all main tabs. These are explicit flow previews.
export function QuickAdd({ tabBarHeight }: { tabBarHeight: number }) {
  const { quickAdd: copy } = useMessages();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const headingRef = useRef<ComponentRef<typeof View>>(null);
  const triggerRef = useRef<ComponentRef<typeof View>>(null);
  const focus = (view: ComponentRef<typeof View> | null) => {
    if (!view) return;
    const node = findNodeHandle(view);
    if (typeof node === 'number') AccessibilityInfo.setAccessibilityFocus(node);
  };
  const close = () => setVisible(false);

  return (
    <>
      <View pointerEvents="box-none" style={[styles.floating, { bottom: tabBarHeight + tokens.spacing.lg, right: insets.right + tokens.spacing.page }]}>
        <View style={tokens.elevation.card}>
          <IconButton ref={triggerRef} icon="plus" label={copy.open} variant="primary" size="large" onPress={() => setVisible(true)} testID="quick-add-open" />
        </View>
      </View>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
        onShow={() => focus(headingRef.current)}
        onDismiss={() => focus(triggerRef.current)}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel={copy.close} accessibilityRole="button" testID="quick-add-backdrop" />
          <View
            style={[styles.sheet, { marginTop: insets.top + tokens.spacing.lg, marginBottom: Math.max(insets.bottom, tokens.spacing.lg), marginLeft: insets.left + tokens.spacing.lg, marginRight: insets.right + tokens.spacing.lg }]}
            accessibilityViewIsModal
            onAccessibilityEscape={close}
            testID="quick-add-sheet"
          >
            <View style={styles.heading}>
              <View ref={headingRef} accessible accessibilityRole="header" accessibilityLabel={copy.title} style={styles.title}>
                <AppText variant="sectionTitle" accessible={false}>{copy.title}</AppText>
              </View>
              <IconButton icon="close" label={copy.close} onPress={close} testID="quick-add-close" />
            </View>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <AppText variant="bodySecondary" tone="textSecondary">{copy.subtitle}</AppText>
              {actions.map(action => (
                <Pressable
                  key={action.id}
                  accessibilityRole="button"
                  accessibilityLabel={copy.actions[action.id]}
                  accessibilityHint={copy.actionHint}
                  onPress={() => { /* Entry flows will be connected in their feature tasks. */ }}
                  style={({ pressed }) => [styles.action, { backgroundColor: pressed ? tokens.colors.primarySubtle : tokens.colors.surface }]}
                  testID={`quick-add-${action.id}`}
                >
                  <View style={styles.actionIcon}><Icon name={action.icon} color={tokens.colors.primaryText} /></View>
                  <AppText variant="body" style={styles.actionLabel}>{copy.actions[action.id]}</AppText>
                  <Icon name="chevron" size="small" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floating: { position: 'absolute' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: tokens.colors.scrim },
  sheet: { maxHeight: tokens.layout.modalMaxHeight, width: 'auto', maxWidth: tokens.layout.contentMaxWidth, borderRadius: tokens.radii.card, backgroundColor: tokens.colors.surface, padding: tokens.spacing.xl },
  heading: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md, paddingBottom: tokens.spacing.md },
  title: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 },
  content: { gap: tokens.spacing.sm, paddingBottom: tokens.spacing.xs },
  action: { flexDirection: 'row', alignItems: 'center', minHeight: tokens.size.button, gap: tokens.spacing.md, borderRadius: tokens.radii.control, paddingVertical: tokens.spacing.sm },
  actionIcon: { padding: tokens.spacing.sm, borderRadius: tokens.radii.control, backgroundColor: tokens.colors.primarySubtle },
  actionLabel: { flex: 1 },
});
