import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mascotAssets } from '../../../shared/assets/mascot';
import { appConfig } from '../../../shared/config/app';
import { tokens } from '../../../shared/theme/tokens';
import { AppText } from '../../../shared/ui/AppText';
import type { OrangeRewardNotice } from '../application/OrangeRewardNotice';
import { rewardFeedbackTiming } from '../application/rewardFeedbackPolicy';
import { getRewardMessages } from '../model/rewardMessages';

type Props = { notice: OrangeRewardNotice | null; onDismiss: (id: string) => void };

/** Only the feedback surface intercepts touches. No modal, backdrop or focus movement. */
export function OrangeRewardFeedback({ notice, onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const offset = useRef(new Animated.Value(tokens.spacing.sm)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  const closing = useRef(false);
  const copy = getRewardMessages(appConfig.defaultLocale);
  const timing = rewardFeedbackTiming[notice?.kind ?? 'micro'];

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); }).catch(() => undefined);
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; motion.remove(); };
  }, []);

  const dismiss = useCallback(() => {
    if (!notice || closing.current) return;
    closing.current = true;
    opacity.stopAnimation(); offset.stopAnimation();
    if (reduceMotion) { onDismiss(notice.id); return; }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: timing.exit, useNativeDriver: true }),
      Animated.timing(offset, { toValue: -tokens.spacing.sm, duration: timing.exit, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onDismiss(notice.id); });
  }, [notice, onDismiss, opacity, offset, reduceMotion, timing]);

  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => gesture.dy < -tokens.spacing.sm && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderMove: (_event, gesture) => {
      if (!reduceMotion && !closing.current) offset.setValue(Math.min(0, gesture.dy));
    },
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dy < -tokens.spacing.xxl || gesture.vy < -0.4) dismiss();
      else Animated.timing(offset, { toValue: 0, duration: reduceMotion ? 0 : tokens.motion.duration.fast, useNativeDriver: true }).start();
    },
    onPanResponderTerminate: () => {
      Animated.timing(offset, { toValue: 0, duration: reduceMotion ? 0 : tokens.motion.duration.fast, useNativeDriver: true }).start();
    },
  }), [dismiss, offset, reduceMotion]);

  useEffect(() => {
    if (!notice) return;
    closing.current = false;
    opacity.setValue(reduceMotion ? 1 : 0);
    offset.setValue(reduceMotion ? 0 : tokens.spacing.sm);
    const entrance = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: reduceMotion ? 0 : timing.enter, useNativeDriver: true }),
      Animated.timing(offset, { toValue: 0, duration: reduceMotion ? 0 : timing.enter, easing: Easing.bezier(...tokens.motion.easing.standard), useNativeDriver: true }),
    ]);
    entrance.start();
    const timer = setTimeout(dismiss, timing.enter + timing.hold + (reduceMotion ? timing.exit : 0));
    return () => { clearTimeout(timer); entrance.stop(); opacity.stopAnimation(); offset.stopAnimation(); };
  }, [notice, reduceMotion, timing, dismiss, opacity, offset]);

  useEffect(() => {
    if (notice) AccessibilityInfo.announceForAccessibility(`${copy.received} ${notice.amount} ${copy.unit(notice.amount)}${notice.includesWelcome ? `. ${copy.welcomeTitle}` : ''}`);
    // One announcement, no live region or forced focus, and automatic dismissal for everyone.
  }, [notice]);

  if (!notice) return null;
  const celebration = notice.kind === 'celebration';
  const amount = new Intl.NumberFormat(appConfig.defaultLocale).format(notice.amount);
  const label = `${copy.received} ${amount} ${copy.unit(notice.amount)}${celebration ? `. ${notice.includesWelcome ? copy.welcomeTitle : copy.milestoneTitle}` : ''}`;
  return (
    <View pointerEvents="box-none" style={[styles.overlay, { top: insets.top + tokens.size.touchTarget + tokens.spacing.md, left: insets.left + tokens.spacing.page, right: insets.right + tokens.spacing.page }]} testID="orange-reward-feedback">
      <Animated.View {...responder.panHandlers} style={[styles.surface, celebration ? styles.celebration : styles.micro, { opacity, transform: [{ translateY: offset }] }]} testID={`orange-reward-${notice.kind}`}>
        <Pressable onPress={dismiss} accessibilityRole="button" accessibilityLabel={label} accessibilityHint={copy.dismiss} testID="orange-reward-dismiss" style={({ pressed }) => [styles.content, pressed && styles.pressed]}>
          {celebration && <Image source={mascotAssets.orangeReward} resizeMode="contain" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.mascot} testID="orange-reward-mascot" />}
          <View style={celebration ? styles.text : styles.microText}>
            <View style={styles.metric} testID="orange-reward-amount" accessible={false}>
              <AppText variant="sectionTitle" tone="primaryText" accessible={false}>+{amount}</AppText>
              <View style={styles.orange} accessible={false}><View style={styles.leaf} /></View>
            </View>
            {celebration ? <>
              <AppText variant="label" accessible={false}>{notice.includesWelcome ? copy.welcomeTitle : copy.milestoneTitle}</AppText>
              <AppText variant="caption" tone="textSecondary" accessible={false}>{notice.includesWelcome ? copy.welcomePhrase : copy.phrase}</AppText>
            </> : <AppText variant="label" tone="textSecondary" accessible={false}>{copy.micro}</AppText>}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', zIndex: 1, alignItems: 'center' },
  surface: { backgroundColor: tokens.colors.surface, borderRadius: tokens.radii.card, ...tokens.elevation.card, maxWidth: tokens.layout.contentMaxWidth },
  celebration: { width: '100%' },
  micro: { alignSelf: 'center', maxWidth: '100%' },
  content: { minHeight: tokens.size.button, padding: tokens.spacing.md, flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md },
  pressed: { opacity: tokens.opacity.pressed },
  mascot: { width: '38%', maxWidth: tokens.spacing.section * 4, aspectRatio: 1 },
  text: { flex: 1, minWidth: 0, gap: tokens.spacing.xs },
  microText: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flexShrink: 1, gap: tokens.spacing.md },
  metric: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm, flexShrink: 1 },
  orange: { width: tokens.size.iconSmall, height: tokens.size.iconSmall, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.primary },
  leaf: { position: 'absolute', top: -tokens.spacing.xs / 2, right: 0, width: tokens.spacing.sm, height: tokens.spacing.xs, borderRadius: tokens.radii.small, backgroundColor: tokens.colors.success, transform: [{ rotate: '-25deg' }] },
});
