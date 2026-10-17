import AsyncStorage from '@react-native-async-storage/async-storage';

import { createOrangeWalletService } from '../../features/rewards/application/OrangeWalletService';
import { createKeyValueOrangeWalletRepository } from '../../infrastructure/rewards/KeyValueOrangeWalletRepository';

const repository = createKeyValueOrangeWalletRepository(AsyncStorage, __DEV__ ? 'developmentDemo' : 'real');
export const orangeWalletService = createOrangeWalletService(repository, {
  now: () => new Date().toISOString(), allowDevelopmentReset: __DEV__,
});
