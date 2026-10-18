import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDevelopmentFoodCatalog } from '../../infrastructure/food-catalog/DevelopmentFoodCatalog';
import { createKeyValueRecentFoodsRepository } from '../../infrastructure/food-catalog/KeyValueRecentFoodsRepository';
import { createFoodAddOperation } from '../nutrition/addCatalogFood';
import { nutritionService } from '../nutrition/nutrition';
import { orangeWalletService } from '../rewards/orangeWallet';

// Replace/compose this port for a real provider in TASK 20; UI knows no provider SDK.
export const foodCatalogProvider = createDevelopmentFoodCatalog();
export const recentFoodsRepository = createKeyValueRecentFoodsRepository(AsyncStorage, __DEV__ ? 'developmentDemo' : 'real');
export const createCatalogFoodAdd = () => createFoodAddOperation({ nutrition: nutritionService, wallet: orangeWalletService, recents: recentFoodsRepository });
