import AsyncStorage from '@react-native-async-storage/async-storage';
import { uuid } from 'expo';
import { createNutritionService } from '../../features/nutrition';
import { createKeyValueNutritionRepository } from '../../infrastructure/nutrition/KeyValueNutritionRepository';

export const nutritionService = createNutritionService(createKeyValueNutritionRepository(AsyncStorage, __DEV__ ? 'developmentDemo' : 'real'), {
  now: () => new Date().toISOString(), nextId: () => uuid.v4(), allowDevelopmentReset: __DEV__,
});
