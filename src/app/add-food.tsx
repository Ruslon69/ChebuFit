import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { parseAddFoodContext } from '../features/nutrition/model/diaryPresentation';
import { getNutritionMessages, nutritionFormatters } from '../features/nutrition/model/messages';
import { appConfig } from '../shared/config/app';
import { getLocalDateKey } from '../shared/utils/localCalendar';
import { AppText } from '../shared/ui/AppText';
import { Button } from '../shared/ui/Button';
import { Card } from '../shared/ui/Card';
import { Screen } from '../shared/ui/Screen';
import { tokens } from '../shared/theme/tokens';

export default function AddFoodScreen() {
  const params = useLocalSearchParams<{ date?: string; meal?: string }>(), router = useRouter();
  const today = getLocalDateKey(new Date()), context = parseAddFoodContext(params, today);
  const copy = getNutritionMessages(appConfig.defaultLocale), format = nutritionFormatters(appConfig.defaultLocale);
  return (
    <>
      <Stack.Screen options={{ title: copy.add }} />
      <Screen scroll edges={['left', 'right', 'bottom']} testID="add-food-screen">
        <Card>
          <View style={styles.content}>
            {context ? (
              <>
                <AppText maxFontSizeMultiplier={tokens.accessibility.bodyTextScale} variant="sectionTitle" testID="add-food-meal">{copy.meals[context.meal]}</AppText>
                <AppText maxFontSizeMultiplier={tokens.accessibility.bodyTextScale} tone="textSecondary" testID="add-food-date">{format.date(context.date, today)}</AppText>
                <AppText maxFontSizeMultiplier={tokens.accessibility.bodyTextScale} variant="bodySecondary" tone="textSecondary">{copy.searchLater}</AppText>
              </>
            ) : (
              <AppText maxFontSizeMultiplier={tokens.accessibility.bodyTextScale}>{copy.invalidContext}</AppText>
            )}
            <Button
              maxFontSizeMultiplier={tokens.accessibility.controlTextScale} label={copy.back} variant="secondary" testID="add-food-back"
              onPress={() => router.canGoBack() ? router.back() : router.replace('/nutrition')}
            />
          </View>
        </Card>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({ content: { gap: tokens.spacing.lg } });
