import type { ReactElement } from 'react';
import { Alert, Image, StyleSheet } from 'react-native';

import { mascotAssets } from '../../../shared/assets/mascot';
import { appConfig } from '../../../shared/config/app';
import { tokens } from '../../../shared/theme/tokens';
import { Screen } from '../../../shared/ui/Screen';
import type { TodayViewModel } from '../model/TodayViewModel';
import { createTodayFormatters, getTodayMessages } from '../model/messages';
import { CaloriesCard } from './CaloriesCard';
import { MealsOverview, WaterCard, WeightCard, WorkoutCard } from './DailyOverview';
import { TodayHeader } from './TodayHeader';

type TodayScreenProps = {
  model: TodayViewModel;
  onOpenNutrition: () => void;
  onOpenProgress: () => void;
  onOpenDesignSystem?: () => void;
  headerArtwork?: ReactElement;
  onAddWater: () => void;
  onRemoveWater: () => void;
};

export function TodayScreen({ model, onOpenNutrition, onOpenProgress, onOpenDesignSystem, headerArtwork, onAddWater, onRemoveWater }: TodayScreenProps) {
  const copy = getTodayMessages(appConfig.defaultLocale);
  const format = createTodayFormatters(appConfig.defaultLocale);
  const preview = (message: string) => Alert.alert(copy.previewTitle, message, [{ text: copy.dismiss }]);

  return (
    <Screen scroll edges={['top', 'left', 'right']} testID="today-screen" contentContainerStyle={styles.page}>
      <TodayHeader
        greeting={copy.greetings[model.greeting]}
        name={model.name}
        date={format.date(model.date)}
        profileLabel={copy.profile}
        orangeBalance={model.orangeBalance === null ? '—' : format.number(model.orangeBalance)}
        orangeBalanceLabel={model.orangeBalance === null ? copy.orangeBalanceUnavailable : copy.orangeBalanceLabel(model.orangeBalance, format.number(model.orangeBalance))}
        onOpenProfile={() => preview(copy.profilePreview)}
        onOpenDesignSystem={onOpenDesignSystem}
        artwork={headerArtwork ?? (
          <Image
            source={mascotAssets.greeting}
            resizeMode="contain"
            accessible={false}
            style={styles.mascot}
            testID="today-mascot"
          />
        )}
      />
      <CaloriesCard nutrition={model.nutrition} copy={copy} format={format} />
      <WaterCard water={model.water} onAdd={onAddWater} onRemove={onRemoveWater} copy={copy} format={format} />
      <MealsOverview meals={model.nutrition?.meals ?? null} onOpen={onOpenNutrition} copy={copy} format={format} />
      <WorkoutCard workout={model.workout} onStart={() => preview(copy.workoutPreview)} copy={copy} />
      <WeightCard weight={model.weight} onOpen={onOpenProgress} copy={copy} format={format} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: tokens.spacing.xxl },
  mascot: { width: '100%', height: '100%' },
});
