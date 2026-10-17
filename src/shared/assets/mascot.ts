import type { ImageRequireSource } from 'react-native';

// Static paths are required by Metro. Import artwork through these stable semantic keys.
export const mascotAssets = {
  master: require('../../../assets/mascot/app/CHEBU-01-master.png') as ImageRequireSource,
  greeting: require('../../../assets/mascot/app/CHEBU-02-greeting.png') as ImageRequireSource,
  water: require('../../../assets/mascot/app/CHEBU-03-water.png') as ImageRequireSource,
  workout: require('../../../assets/mascot/app/CHEBU-04-workout.png') as ImageRequireSource,
  success: require('../../../assets/mascot/app/CHEBU-05-success.png') as ImageRequireSource,
  tip: require('../../../assets/mascot/app/CHEBU-06-tip.png') as ImageRequireSource,
  orangeReward: require('../../../assets/mascot/app/CHEBU-07-orange-reward.png') as ImageRequireSource,
  wardrobe: require('../../../assets/mascot/app/CHEBU-08-wardrobe.png') as ImageRequireSource,
  nutrition: require('../../../assets/mascot/app/CHEBU-09-nutrition.png') as ImageRequireSource,
  progress: require('../../../assets/mascot/app/CHEBU-10-progress.png') as ImageRequireSource,
  empty: require('../../../assets/mascot/app/CHEBU-11-empty.png') as ImageRequireSource,
  profile: require('../../../assets/mascot/app/CHEBU-12-profile.png') as ImageRequireSource,
} as const;

export type MascotAssetName = keyof typeof mascotAssets;
