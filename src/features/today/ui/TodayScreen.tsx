import { useState, type ReactElement } from 'react';
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
};

export function TodayScreen({ model, onOpenNutrition, onOpenProgress, onOpenDesignSystem, headerArtwork }: TodayScreenProps) {
  const copy = getTodayMessages(appConfig.defaultLocale);
  const format = createTodayFormatters(appConfig.defaultLocale);
  const [waterMl, setWaterMl] = useState(model.water.consumedMl);
  const preview = (message: string) => Alert.alert(copy.previewTitle, message, [{ text: copy.dismiss }]);
  const addWater = () => setWaterMl(current => Math.min(model.water.targetMl, Math.max(0, current) + model.water.portionMl));

  return (
    <Screen scroll edges={['top', 'left', 'right']} testID="today-screen" contentContainerStyle={styles.page}>
      <TodayHeader
        greeting={copy.greetings[model.greeting]}
        name={model.name}
        date={format.date(model.date)}
        profileLabel={copy.profile}
        orangeBalance={format.number(model.orangeBalance)}
        orangeBalanceLabel={copy.orangeBalanceLabel(model.orangeBalance, format.number(model.orangeBalance))}
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
      <CaloriesCard calories={model.calories} macros={model.macros} copy={copy} format={format} />
      <WaterCard water={model.water} consumedMl={waterMl} onAdd={addWater} copy={copy} format={format} />
      <MealsOverview meals={model.meals} onOpen={onOpenNutrition} copy={copy} format={format} />
      <WorkoutCard workout={model.workout} onStart={() => preview(copy.workoutPreview)} copy={copy} />
      <WeightCard weight={model.weight} onOpen={onOpenProgress} copy={copy} format={format} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: tokens.spacing.xxl },
  mascot: { width: '100%', height: '100%' },
});
