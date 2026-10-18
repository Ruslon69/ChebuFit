import AsyncStorage from '@react-native-async-storage/async-storage';
import { uuid } from 'expo';
import { createPersonalFoodService } from '../../features/personal-foods/application/PersonalFoodService';
import { createKeyValuePersonalFoodRepository } from '../../infrastructure/personal-foods/KeyValuePersonalFoodRepository';

export const personalFoodService = createPersonalFoodService(createKeyValuePersonalFoodRepository(AsyncStorage, __DEV__ ? 'developmentDemo' : 'real'), {
  now: () => new Date().toISOString(), nextId: () => uuid.v4(),
});
