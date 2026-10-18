import AsyncStorage from '@react-native-async-storage/async-storage';
import { createWaterService } from '../../features/water';
import { createKeyValueWaterRepository } from '../../infrastructure/water/KeyValueWaterRepository';

export const waterService = createWaterService(createKeyValueWaterRepository(AsyncStorage, __DEV__ ? 'developmentDemo' : 'real'), {
  now: () => new Date().toISOString(), allowDevelopmentReset: __DEV__,
});
