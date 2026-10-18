import { createOpenFoodFactsProvider } from '../../infrastructure/food-catalog/OpenFoodFactsProvider';
import { foodCatalogConfig } from '../../shared/config/foodCatalog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDevelopmentFoodCatalog } from '../../infrastructure/food-catalog/DevelopmentFoodCatalog';
import { createKeyValueRecentFoodsRepository } from '../../infrastructure/food-catalog/KeyValueRecentFoodsRepository';
import { createFoodAddOperation } from '../nutrition/addCatalogFood';
import { nutritionService } from '../nutrition/nutrition';
import { orangeWalletService } from '../rewards/orangeWallet';
import { personalFoodService } from '../personal-foods/personalFoods';
import { createPersonalFirstFoodCatalog, resolvePersonalCatalogFood } from '../../features/food-catalog/application/PersonalFirstFoodCatalog';
import { personalFoodProviderId } from '../../features/personal-foods/domain/personalFood';

// Explicit opt-in fixtures only in development; never merge illustrative foods into OFF.
const externalFoodCatalogProvider = __DEV__ && process.env.EXPO_PUBLIC_FOOD_CATALOG_PROVIDER === 'development'
  ? createDevelopmentFoodCatalog() : createOpenFoodFactsProvider(foodCatalogConfig);
export const foodCatalogProvider = createPersonalFirstFoodCatalog(externalFoodCatalogProvider, personalFoodService);
export const recentFoodsRepository = createKeyValueRecentFoodsRepository(AsyncStorage, __DEV__ ? 'developmentDemo' : 'real');
export const createCatalogFoodAdd = () => createFoodAddOperation({ nutrition: nutritionService, wallet: orangeWalletService, recents: recentFoodsRepository,
  resolveFood: food => resolvePersonalCatalogFood(food, personalFoodService) });
export async function deletePersonalCatalogFood(id: string) {
  const result = await personalFoodService.delete(id);
  if (result.ok) {
    // Canonical deletion is authoritative even if best-effort Recent cleanup fails.
    // Discovery also reconciles all personal references and hides missing products.
    try { await recentFoodsRepository.remove?.({ providerId: personalFoodProviderId, foodId: id }); } catch { /* safe stale-reference filtering */ }
  }
  return result;
}
