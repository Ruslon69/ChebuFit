import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { PersonalFoodScreen } from '../features/personal-foods/ui/PersonalFoodScreen';
import { isPersonalFoodId } from '../features/personal-foods/domain/personalFood';
import { getPersonalFoodMessages } from '../features/personal-foods/model/messages';
import { parseAddFoodContext } from '../features/nutrition/model/diaryPresentation';
import { normalizeFoodBarcode } from '../features/food-catalog/domain/barcode';
import { getFoodCatalogMessages } from '../features/food-catalog/model/messages';
import { getLocalDateKey } from '../shared/utils/localCalendar';
import { appConfig } from '../shared/config/app';
import { Screen } from '../shared/ui/Screen';
import { AppText } from '../shared/ui/AppText';
import { Button } from '../shared/ui/Button';

export default function PersonalFoodRoute() {
  const params = useLocalSearchParams<{ date?: string; meal?: string; id?: string; barcode?: string }>(), router = useRouter();
  const context = parseAddFoodContext(params, getLocalDateKey(new Date())), copy = getPersonalFoodMessages(appConfig.defaultLocale), catalogCopy = getFoodCatalogMessages(appConfig.defaultLocale);
  const valid = context && (params.id === undefined || isPersonalFoodId(params.id)) && (params.barcode === undefined || normalizeFoodBarcode(params.barcode));
  return <>
    <Stack.Screen options={{ title: params.id ? copy.edit : copy.create }} />
    {valid ? <PersonalFoodScreen key={`${context.date}:${context.meal}:${params.id ?? 'new'}:${params.barcode ?? ''}`} context={context} id={params.id} barcode={params.barcode} />
      : <Screen edges={['left', 'right', 'bottom']}><AppText>{catalogCopy.invalidContext}</AppText><Button label={copy.back} onPress={() => router.canGoBack() ? router.back() : router.replace('/nutrition')} /></Screen>}
  </>;
}
