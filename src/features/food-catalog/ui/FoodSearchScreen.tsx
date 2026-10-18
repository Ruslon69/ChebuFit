import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Keyboard, Linking, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFoodSearch } from '../../../application/food-catalog/useFoodSearch';
import { useRewardFeedback } from '../../../application/rewards/RewardFeedbackProvider';
import type { OrangeRewardNotice } from '../../rewards';
import type { LocalDateKey, MealType } from '../../nutrition';
import { getNutritionMessages, nutritionFormatters } from '../../nutrition/model/messages';
import { appConfig } from '../../../shared/config/app';
import { getLocalDateKey } from '../../../shared/utils/localCalendar';
import { tokens as t } from '../../../shared/theme/tokens';
import { Screen } from '../../../shared/ui/Screen';
import { AppText } from '../../../shared/ui/AppText';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/ui/Icon';
import { IconButton } from '../../../shared/ui/IconButton';
import { catalogFoodIdentity } from '../domain/catalogFood';
import type { CatalogFood } from '../domain/types';
import { foodNutrientLine, getFoodCatalogMessages } from '../model/messages';
import { FoodSelectionSheet } from './FoodSelectionSheet';

type Context = { date: LocalDateKey; meal: MealType };
export function FoodSearchScreen({ context }: { context: Context }) {
  const router = useRouter(), feedback = useRewardFeedback();
  const locale = appConfig.defaultLocale, copy = getFoodCatalogMessages(locale), nutritionCopy = getNutritionMessages(locale), format = nutritionFormatters(locale);
  const [query, setQuery] = useState(''), [selected, setSelected] = useState<CatalogFood | null>(null);
  const { state, search, recents, recentFailed, disclosure, attribution } = useFoodSearch();
  const [now, setNow] = useState(Date.now);
  const retryAt = state.status === 'error' ? state.retryAt : undefined;
  useEffect(() => {
    if (!retryAt) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.max(0, retryAt - Date.now()) + 10);
    return () => clearTimeout(timer);
  }, [retryAt]);
  const submit = () => { Keyboard.dismiss(); void search.submit(); };
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    if (state.status === 'error' || (state.status === 'initial' && state.failed)) AccessibilityInfo.announceForAccessibility(state.status === 'error' && state.error === 'rateLimited' ? copy.rateLimited : copy.error);
    else if (state.status === 'empty') AccessibilityInfo.announceForAccessibility(copy.noResults);
    else if (state.status === 'searching') {
      const timer = setTimeout(() => AccessibilityInfo.announceForAccessibility(copy.searching), 600);
      return () => clearTimeout(timer);
    }
  }, [state, copy]);
  const changeQuery = (text: string) => { setQuery(text); search.setQuery(text); };
  const select = (food: CatalogFood) => { Keyboard.dismiss(); setSelected(food); };
  const added = (notice: OrangeRewardNotice | null) => {
    setSelected(null);
    if (router.canGoBack()) router.back(); else router.replace('/nutrition');
    feedback.show(notice);
  };
  const recentIdentities = useMemo(() => new Set(recents.map(item => catalogFoodIdentity(item.food))), [recents]);
  const rows = (foods: readonly CatalogFood[]) => foods.map(food => {
    const nutrientLine = foodNutrientLine(food.nutrients, locale);
    return (
      <Pressable
        key={catalogFoodIdentity(food)} testID={`food-result-${food.source.providerId}-${food.source.foodId}`}
        accessibilityRole="button" accessibilityLabel={`${food.name}${food.brand ? `, ${food.brand}` : ''}. ${nutrientLine}. ${copy.per100}`}
        accessibilityHint={copy.select} onPress={() => select(food)}
        style={({ pressed }) => [styles.row, pressed && { opacity: t.opacity.pressed }]}
      >
        <AppText maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{food.name}</AppText>
        {food.brand && <AppText variant="bodySecondary" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{food.brand}</AppText>}
        <AppText variant="bodySecondary" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{nutrientLine}</AppText>
        <AppText variant="caption" tone="textTertiary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.per100}</AppText>
      </Pressable>
    );
  });
  const filteredRecents = search.policy && query.trim()
    ? recents.filter(item => `${item.food.name} ${item.food.brand ?? ''}`.toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale))) : recents;
  const previous = search.getPrevious();
  const renderPrevious = () => previous && previous.foods.length > 0 && (
    <View style={styles.section}><AppText variant="label" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.lastSearch}: {previous.query}</AppText><Card padding="compact">{rows(previous.foods)}</Card></View>
  );
  const renderRecents = (all = false) => (all ? recents : filteredRecents).length > 0 && (
    <View style={styles.section}>
      <AppText variant="cardTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{copy.recents}</AppText>
      <Card padding="compact" testID="food-recents">{rows((all ? recents : filteredRecents).map(item => item.food))}</Card>
    </View>
  );
  const renderSearchState = () => {
    if (state.status === 'initial') {
      const suggestions = state.foods.filter(food => !recentIdentities.has(catalogFoodIdentity(food)));
      return (
        <>
          {disclosure === 'illustrativeNutrition' && (
            <AppText variant="caption" tone="textTertiary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.catalogNote}</AppText>
          )}
          {search.policy && <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.searchHint}</AppText>}
          {renderRecents()}
          {recentFailed && <AppText variant="caption" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.recentUnavailable}</AppText>}
          <View style={styles.section} testID="food-search-initial">
            {(state.loading || state.failed || suggestions.length > 0) && (
              <AppText variant="cardTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{copy.suggestions}</AppText>
            )}
            {state.loading ? (
              <ActivityIndicator color={t.colors.primaryText} accessibilityLabel={copy.searching} />
            ) : state.failed ? (
              <View style={styles.section}>
                <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.error}</AppText>
                <Button label={copy.retry} variant="secondary" onPress={() => void search.retry()} maxFontSizeMultiplier={t.accessibility.controlTextScale} />
              </View>
            ) : suggestions.length > 0 ? <Card padding="compact">{rows(suggestions)}</Card> : null}
          </View>
        </>
      );
    }
    if (state.status === 'ready') return (
      <View style={styles.section} testID="food-search-ready">
        <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{Array.from(query.trim()).length < (search.policy?.minimumLength ?? 1) ? copy.minimumQuery : copy.searchHint}</AppText>
        {renderRecents()}
        {renderPrevious()}
      </View>
    );
    if (state.status === 'searching') return (
      <>
      <View style={styles.status} accessibilityLiveRegion="polite" testID="food-search-loading">
        <ActivityIndicator color={t.colors.primaryText} />
        <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.searching}</AppText>
      </View>
      {renderRecents()}{renderPrevious()}
      </>
    );
    if (state.status === 'error') return (
      <>
        <Card testID="food-search-error">
          <View style={styles.section} accessibilityLiveRegion="polite">
            <AppText variant="cardTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{state.error === 'rateLimited' ? copy.rateLimited : copy.error}</AppText>
            <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{state.error === 'rateLimited' ? copy.rateHint : copy.errorHint}</AppText>
            <Button label={copy.retry} variant="secondary" disabled={!!retryAt && Math.max(now, Date.now()) < retryAt} onPress={() => void search.retry()} testID="food-search-retry" maxFontSizeMultiplier={t.accessibility.controlTextScale} />
          </View>
        </Card>
        {renderRecents(true)}{renderPrevious()}
      </>
    );
    if (state.status === 'empty') return (
      <Card testID="food-search-empty">
        <View style={styles.section} accessibilityLiveRegion="polite">
          <AppText variant="cardTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{copy.noResults}</AppText>
          <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.noResultsHint}</AppText>
          <AppText variant="label" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.notFound}</AppText>
          <Button label={copy.custom} disabled variant="secondary" onPress={() => {}} maxFontSizeMultiplier={t.accessibility.controlTextScale} />
        </View>
      </Card>
    );
    return <Card padding="compact" testID="food-search-results">{rows(state.foods)}</Card>;
  };
  return (
    <>
      <Screen scroll keyboardAware edges={['left', 'right', 'bottom']} testID="food-search-screen" contentContainerStyle={styles.content}>
        <AppText variant="label" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale} testID="food-search-context">
          {nutritionCopy.meals[context.meal]} · {format.date(context.date, getLocalDateKey(new Date()))}
        </AppText>
        <View style={styles.search}>
          <Icon name="search" />
          <TextInput
            value={query} onChangeText={changeQuery} maxLength={200} placeholder={copy.search} placeholderTextColor={t.colors.textTertiary}
            accessibilityLabel={copy.search} keyboardType="default" returnKeyType="search" autoCorrect={false} autoCapitalize="none"
            onSubmitEditing={submit} maxFontSizeMultiplier={t.accessibility.controlTextScale} style={styles.input} testID="food-search-input"
          />
          {query.length > 0 && <IconButton icon="close" variant="ghost" label={copy.clear} onPress={() => changeQuery('')} testID="food-search-clear" />}
        </View>
        {search.policy && <Button label={copy.submit} variant="secondary" disabled={Array.from(query.trim()).length < search.policy.minimumLength || state.status === 'searching' || (!!retryAt && Math.max(now, Date.now()) < retryAt)} onPress={submit} testID="food-search-submit" maxFontSizeMultiplier={t.accessibility.controlTextScale} />}
        {renderSearchState()}
        {attribution && <View style={styles.section}>
          <AppText variant="caption" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.remoteNote}</AppText>
          <View style={styles.links}>
            <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(attribution.url).catch(() => {})} style={styles.link}><AppText variant="caption" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.source}: {attribution.name}</AppText></Pressable>
            <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(attribution.licenseUrl).catch(() => {})} style={styles.link}><AppText variant="caption" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{attribution.license}</AppText></Pressable>
          </View>
        </View>}
      </Screen>
      {selected && (
        <FoodSelectionSheet key={catalogFoodIdentity(selected)} food={selected} date={context.date} initialMeal={context.meal} onClose={() => setSelected(null)} onAdded={added} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }, link: { minHeight: t.size.touchTarget, justifyContent: 'center' },
  content: { gap: t.spacing.xl }, section: { gap: t.spacing.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, backgroundColor: t.colors.surface, borderRadius: t.radii.control, paddingLeft: t.spacing.lg, paddingRight: t.spacing.xs },
  input: { ...t.typography.body, color: t.colors.text, minHeight: t.size.button, flex: 1, paddingVertical: t.spacing.md },
  row: { minHeight: t.size.button, gap: t.spacing.xs, padding: t.spacing.sm, borderBottomWidth: t.stroke.thin, borderBottomColor: t.colors.divider },
  status: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.lg },
});
