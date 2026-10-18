import { createOpenFoodFactsProvider } from '../../infrastructure/food-catalog/OpenFoodFactsProvider';
import { foodCatalogConfig } from '../../shared/config/foodCatalog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDevelopmentFoodCatalog } from '../../infrastructure/food-catalog/DevelopmentFoodCatalog';
import { createKeyValueRecentFoodsRepository } from '../../infrastructure/food-catalog/KeyValueRecentFoodsRepository';
import { createFoodAddOperation } from '../nutrition/addCatalogFood';
import { nutritionService } from '../nutrition/nutrition';
import { orangeWalletService } from '../rewards/orangeWallet';

// Explicit opt-in fixtures only in development; never merge illustrative foods into OFF.
export const foodCatalogProvider = __DEV__ && process.env.EXPO_PUBLIC_FOOD_CATALOG_PROVIDER === 'development'
  ? createDevelopmentFoodCatalog() : createOpenFoodFactsProvider(foodCatalogConfig);
export const recentFoodsRepository = createKeyValueRecentFoodsRepository(AsyncStorage, __DEV__ ? 'developmentDemo' : 'real');
export const createCatalogFoodAdd = () => createFoodAddOperation({ nutrition: nutritionService, wallet: orangeWalletService, recents: recentFoodsRepository });
