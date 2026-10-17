import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mascotAssets } from '../../../shared/assets/mascot';
import { appConfig } from '../../../shared/config/app';
import { tokens } from '../../../shared/theme/tokens';
import { AppText } from '../../../shared/ui/AppText';
import { Card } from '../../../shared/ui/Card';
import { IconButton } from '../../../shared/ui/IconButton';
import type { OrangeRewardNotice } from '../application/OrangeRewardNotice';
import { getRewardMessages } from '../model/rewardMessages';

type Props = { notice: OrangeRewardNotice | null; onDismiss: (id: string) => void };

/** Nonmodal feedback: no backdrop, focus movement, or global reward queue. */
export function OrangeRewardFeedback({ notice, onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const offset = useRef(new Animated.Value(tokens.spacing.sm)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  const [screenReader, setScreenReader] = useState(false);
  const copy = getRewardMessages(appConfig.defaultLocale);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); }).catch(() => undefined);
    void AccessibilityInfo.isScreenReaderEnabled().then(value => { if (mounted) setScreenReader(value); }).catch(() => undefined);
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const reader = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReader);
    return () => { mounted = false; motion.remove(); reader.remove(); };
  }, []);
  const dismiss = useCallback(() => {
    if (!notice) return;
    if (reduceMotion) { onDismiss(notice.id); return; }
    Animated.timing(opacity, { toValue: 0, duration: tokens.motion.duration.fast, useNativeDriver: true })
      .start(({ finished }) => { if (finished) onDismiss(notice.id); });
  }, [notice, onDismiss, opacity, reduceMotion]);
  useEffect(() => {
    if (!notice) return;
    opacity.setValue(reduceMotion ? 1 : 0);
    offset.setValue(reduceMotion ? 0 : tokens.spacing.sm);
    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: reduceMotion ? 0 : tokens.motion.duration.standard, useNativeDriver: true }),
      Animated.timing(offset, { toValue: 0, duration: reduceMotion ? 0 : tokens.motion.duration.standard, easing: Easing.bezier(...tokens.motion.easing.standard), useNativeDriver: true }),
    ]);
    animation.start();
    const timer = setTimeout(dismiss, screenReader ? 8000 : 4000);
    return () => { clearTimeout(timer); animation.stop(); };
  }, [notice, reduceMotion, screenReader, dismiss, opacity, offset]);
  useEffect(() => {
    if (notice) AccessibilityInfo.announceForAccessibility(`${copy.received} ${notice.amount} ${copy.unit(notice.amount)}`);
    // Announce once per notice, without moving or trapping focus.
  }, [notice]);
  if (!notice) return null;
  const amount = new Intl.NumberFormat(appConfig.defaultLocale).format(notice.amount);
  return (
    <Animated.View pointerEvents="box-none" style={[styles.overlay, { top: insets.top + tokens.spacing.xxl, left: insets.left + tokens.spacing.page, right: insets.right + tokens.spacing.page, opacity, transform: [{ translateY: offset }] }]} testID="orange-reward-feedback">
      <Card padding="standard">
        <View style={styles.row}>
          <Image source={mascotAssets.orangeReward} resizeMode="contain" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.mascot} testID="orange-reward-mascot" />
          <View style={styles.text}>
            <View style={styles.heading}>
              <View accessible accessibilityLabel={`${copy.received} ${amount} ${copy.unit(notice.amount)}`} style={styles.metric} testID="orange-reward-amount">
                <AppText variant="pageTitle" tone="primaryText" accessible={false}>+{amount}</AppText>
                <AppText variant="caption" tone="primaryText" accessible={false}>{copy.unit(notice.amount)}</AppText>
              </View>
              <IconButton icon="close" variant="ghost" label={copy.dismiss} onPress={dismiss} testID="orange-reward-dismiss" />
            </View>
            <AppText variant="bodySecondary" tone="textSecondary">{notice.includesWelcome ? copy.welcomePhrase : copy.phrase}</AppText>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', zIndex: 1, maxWidth: tokens.layout.contentMaxWidth, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.md },
  mascot: { width: '40%', maxWidth: tokens.spacing.section * 4, aspectRatio: 1 },
  text: { flex: 1, minWidth: 0, gap: tokens.spacing.sm },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: tokens.spacing.xs },
  metric: { flexShrink: 1 },
});
