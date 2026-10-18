import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FoodScannerScreen } from '../features/food-catalog/ui/FoodScannerScreen';
import { getScannerMessages } from '../features/food-catalog/model/scannerMessages';
import { getFoodCatalogMessages } from '../features/food-catalog/model/messages';
import { parseAddFoodContext } from '../features/nutrition/model/diaryPresentation';
import { appConfig } from '../shared/config/app';
import { getLocalDateKey } from '../shared/utils/localCalendar';
import { AppText } from '../shared/ui/AppText';
import { Button } from '../shared/ui/Button';
import { Screen } from '../shared/ui/Screen';

export default function ScanFoodRoute() {
  const params = useLocalSearchParams<{ date?: string; meal?: string }>(), router = useRouter();
  const context = parseAddFoodContext(params, getLocalDateKey(new Date()));
  const copy = getFoodCatalogMessages(appConfig.defaultLocale);
  return <>
    <Stack.Screen options={{ title: getScannerMessages(appConfig.defaultLocale).title }} />
    {context ? <FoodScannerScreen key={`${context.date}:${context.meal}`} context={context} /> : <Screen edges={['left', 'right', 'bottom']}>
      <AppText>{copy.invalidContext}</AppText><Button label={copy.back} onPress={() => router.canGoBack() ? router.back() : router.replace('/nutrition')} />
    </Screen>}
  </>;
}
