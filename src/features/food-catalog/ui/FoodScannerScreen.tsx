import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, AppState, Keyboard, Linking, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useBarcodeLookup } from '../../../application/food-catalog/useBarcodeLookup';
import { useRewardFeedback } from '../../../application/rewards/RewardFeedbackProvider';
import type { BarcodeContext } from '../application/BarcodeLookupController';
import { foodBarcodeTypes } from '../domain/barcode';
import { cameraPermissionState, shouldMountScanner } from '../model/scannerPresentation';
import { getScannerMessages } from '../model/scannerMessages';
import { getFoodCatalogMessages } from '../model/messages';
import { getNutritionMessages, nutritionFormatters } from '../../nutrition/model/messages';
import { appConfig } from '../../../shared/config/app';
import { getLocalDateKey } from '../../../shared/utils/localCalendar';
import { tokens as t } from '../../../shared/theme/tokens';
import { Screen } from '../../../shared/ui/Screen';
import { AppText } from '../../../shared/ui/AppText';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { FoodSelectionSheet } from './FoodSelectionSheet';

export function FoodScannerScreen({ context }: { context: BarcodeContext }) {
  const router = useRouter(), feedback = useRewardFeedback();
  const locale = appConfig.defaultLocale, copy = getScannerMessages(locale), catalogCopy = getFoodCatalogMessages(locale);
  const nutritionCopy = getNutritionMessages(locale), format = nutritionFormatters(locale);
  const { controller, state, focused, foreground } = useBarcodeLookup(context);
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const access = cameraPermissionState(permission);
  const [manual, setManual] = useState(false), [draft, setDraft] = useState(''), [upcE, setUpcE] = useState(false);
  const [unavailable, setUnavailable] = useState(false), [ready, setReady] = useState(false), [requesting, setRequesting] = useState(false);
  const [settingsFailed, setSettingsFailed] = useState(false), [now, setNow] = useState(Date.now);
  const requestLock = useRef(false);
  const cameraMounted = shouldMountScanner({ focused, foreground, permission: access, unavailable, manual, lookupStatus: state.status });
  const retryAt = state.status === 'error' ? state.retryAt : undefined;
  useEffect(() => {
    const listener = AppState.addEventListener('change', value => { if (value === 'active') void getPermission().catch(() => {}); });
    return () => listener.remove();
  }, [getPermission]);
  useEffect(() => {
    if (!cameraMounted) { setReady(false); return; }
    if (ready) return;
    const timer = setTimeout(() => setUnavailable(true), 10000);
    return () => clearTimeout(timer);
  }, [cameraMounted, ready]);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let mounted = true;
    void CameraView.isAvailableAsync().then(value => { if (mounted && !value) setUnavailable(true); }).catch(() => { if (mounted) setUnavailable(true); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (!retryAt) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.max(0, retryAt - Date.now()) + 10);
    return () => clearTimeout(timer);
  }, [retryAt]);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    if (state.status === 'lookingUp') AccessibilityInfo.announceForAccessibility(copy.looking);
    if (state.status === 'notFound') AccessibilityInfo.announceForAccessibility(copy.notFound);
    if (state.status === 'error') AccessibilityInfo.announceForAccessibility(state.error === 'rateLimited' ? catalogCopy.rateLimited : copy.lookupError);
    if (state.status === 'invalid') AccessibilityInfo.announceForAccessibility(copy.invalid);
  }, [state, copy, catalogCopy]);
  const allow = async () => {
    if (requestLock.current) return;
    requestLock.current = true; setRequesting(true);
    try { await requestPermission(); } catch { setUnavailable(true); }
    finally { requestLock.current = false; setRequesting(false); }
  };
  const enterManual = () => { controller.reset(); setManual(true); setSettingsFailed(false); };
  const rescan = () => { controller.reset(); setManual(false); setUnavailable(false); };
  const searchByName = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/add-food', params: context });
  };
  const lookup = () => { Keyboard.dismiss(); void controller.submit(draft, 'manual', upcE ? 'upc_e' : undefined); };
  const text = (value: string) => <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{value}</AppText>;
  const heading = (value: string) => <AppText variant="sectionTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{value}</AppText>;
  const commonActions = () => <>
    <Button label={copy.manual} variant="secondary" onPress={enterManual} testID="scanner-manual" maxFontSizeMultiplier={t.accessibility.controlTextScale} />
    <Button label={copy.search} variant="ghost" onPress={searchByName} testID="scanner-search" maxFontSizeMultiplier={t.accessibility.controlTextScale} />
  </>;
  return (
    <>
      <Screen scroll keyboardAware edges={['left', 'right', 'bottom']} contentContainerStyle={styles.content} testID="scanner-screen">
        <AppText variant="label" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale} testID="scanner-context">{nutritionCopy.meals[context.meal]} · {format.date(context.date, getLocalDateKey(new Date()))}</AppText>
        {(state.status === 'idle' || state.status === 'invalid') && manual ? (
          <Card testID="barcode-manual-entry"><View style={styles.section}>
            {heading(copy.manualTitle)}
            <AppText variant="label" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.code}</AppText>
            <TextInput value={draft} onChangeText={value => { setDraft(value); if (value.trim().length !== 8) setUpcE(false); }} keyboardType="number-pad" returnKeyType="search" onSubmitEditing={lookup}
              autoCorrect={false} autoCapitalize="none" maxLength={32} accessibilityLabel={copy.code} maxFontSizeMultiplier={t.accessibility.controlTextScale} style={styles.input} testID="barcode-input" />
            {state.status === 'invalid' && <AppText tone="destructive" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.invalid}</AppText>}
            {draft.trim().length === 8 && <>
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: upcE }} onPress={() => setUpcE(value => !value)} style={styles.shortCode} testID="barcode-upce">
                <Icon name={upcE ? 'check' : 'barcode'} color={upcE ? t.colors.primaryText : t.colors.textSecondary} />
                <AppText variant="label" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.shortCode}</AppText>
              </Pressable>
              {text(copy.shortHint)}
            </>}
            <Button label={copy.find} onPress={lookup} testID="barcode-submit" maxFontSizeMultiplier={t.accessibility.controlTextScale} />
            <Button label={copy.rescan} variant="ghost" onPress={rescan} testID="scanner-rescan" maxFontSizeMultiplier={t.accessibility.controlTextScale} />
          </View></Card>
        ) : state.status === 'lookingUp' ? (
          <Card testID="barcode-looking-up"><View style={styles.section} accessibilityLiveRegion="polite"><ActivityIndicator color={t.colors.primaryText} />{heading(copy.looking)}{text(`${copy.code}: ${state.code}`)}</View></Card>
        ) : state.status === 'notFound' || state.status === 'error' ? (
          <Card testID={state.status === 'notFound' ? 'barcode-not-found' : 'barcode-error'}><View style={styles.section} accessibilityLiveRegion="polite">
            {heading(state.status === 'notFound' ? copy.notFound : state.error === 'rateLimited' ? catalogCopy.rateLimited : state.error === 'invalidFood' ? copy.unusable : copy.lookupError)}
            {text(state.status === 'notFound' ? copy.notFoundHint : state.error === 'rateLimited' ? catalogCopy.rateHint : state.error === 'invalidFood' ? copy.unusableHint : copy.lookupHint)}
            {text(`${copy.code}: ${state.code}`)}
            {state.status === 'error' && <Button label={copy.retry} disabled={!!retryAt && Math.max(now, Date.now()) < retryAt} onPress={() => void controller.retry()} testID="barcode-retry" maxFontSizeMultiplier={t.accessibility.controlTextScale} />}
            <Button label={copy.search} variant={state.status === 'notFound' ? 'primary' : 'ghost'} onPress={searchByName} testID="scanner-search" maxFontSizeMultiplier={t.accessibility.controlTextScale} />
            <Button label={copy.another} variant="secondary" onPress={enterManual} testID="scanner-manual" maxFontSizeMultiplier={t.accessibility.controlTextScale} />
            <Button label={copy.rescan} variant="ghost" onPress={rescan} testID="scanner-rescan" maxFontSizeMultiplier={t.accessibility.controlTextScale} />
          </View></Card>
        ) : state.status !== 'found' ? (
          <>
            {cameraMounted ? <>
              <View style={styles.preview} testID="scanner-camera-preview">
                <CameraView style={StyleSheet.absoluteFill} facing="back" mode="picture" mute enableTorch={false}
                  barcodeScannerSettings={{ barcodeTypes: [...foodBarcodeTypes] }}
                  onBarcodeScanned={result => { if (cameraMounted) void controller.submit(result.data, 'camera', result.type); }}
                  onCameraReady={() => setReady(true)} onMountError={() => setUnavailable(true)}
                  accessible={false} importantForAccessibility="no-hide-descendants" testID="food-camera" />
                <View pointerEvents="none" style={styles.guide} accessible={false} />
              </View>
              {heading(copy.instruction)}{text(copy.guide)}
            </> : <Card testID="scanner-permission"><View style={styles.section}>
              {unavailable ? <>{heading(copy.unavailable)}{text(copy.unavailableHint)}</> : access === 'checking' ? <><ActivityIndicator color={t.colors.primaryText} />{text(copy.checking)}</>
                : <>
                  {heading(access === 'request' ? copy.permissionTitle : access === 'granted' ? copy.instruction : copy.denied)}
                  {text(access === 'settings' ? copy.settingsHint : copy.permission)}
                  {(access === 'request' || access === 'denied') && <Button label={copy.allow} loading={requesting} onPress={() => void allow()} testID="scanner-allow" maxFontSizeMultiplier={t.accessibility.controlTextScale} />}
                  {access === 'settings' && <Button label={copy.settings} onPress={() => void Linking.openSettings().catch(() => setSettingsFailed(true))} testID="scanner-settings" maxFontSizeMultiplier={t.accessibility.controlTextScale} />}
                </>}
              {settingsFailed && text(copy.settingsError)}
            </View></Card>}
            {commonActions()}
          </>
        ) : null}
      </Screen>
      {state.status === 'found' && focused && <FoodSelectionSheet food={state.food} date={state.context.date} initialMeal={state.context.meal}
        onClose={rescan} onAdded={notice => { router.dismissTo('/nutrition'); feedback.show(notice); }} />}
    </>
  );
}
const styles = StyleSheet.create({
  content: { gap: t.spacing.xl }, section: { gap: t.spacing.lg },
  input: { ...t.typography.cardTitle, color: t.colors.text, minHeight: t.size.button, backgroundColor: t.colors.surfaceSecondary, borderRadius: t.radii.control, padding: t.spacing.lg },
  shortCode: { minHeight: t.size.touchTarget, flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, flexWrap: 'wrap' },
  preview: { width: '100%', aspectRatio: 1.2, borderRadius: t.radii.card, overflow: 'hidden', backgroundColor: t.colors.text, justifyContent: 'center', alignItems: 'center' },
  guide: { width: '80%', aspectRatio: 2.4, borderRadius: t.radii.control, borderWidth: t.stroke.thin * 2, borderColor: t.colors.surface },
});
