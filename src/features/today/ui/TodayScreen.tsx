import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { appConfig } from '../../../shared/config/app';
import { tokens } from '../../../shared/theme/tokens';
import { AppText } from '../../../shared/ui/AppText';
import { IconButton } from '../../../shared/ui/IconButton';
import { Screen } from '../../../shared/ui/Screen';
import type { TodayViewModel } from '../model/TodayViewModel';
import { createTodayFormatters, getTodayMessages } from '../model/messages';
import { CaloriesCard } from './CaloriesCard';
import { MealsOverview, WaterCard, WeightCard, WorkoutCard } from './DailyOverview';

type TodayScreenProps = {
  model: TodayViewModel;
  onOpenNutrition: () => void;
  onOpenProgress: () => void;
  onOpenDesignSystem?: () => void;
};

export function TodayScreen({ model, onOpenNutrition, onOpenProgress, onOpenDesignSystem }: TodayScreenProps) {
  const copy = getTodayMessages(appConfig.defaultLocale);
  const format = createTodayFormatters(appConfig.defaultLocale);
  const [waterMl, setWaterMl] = useState(model.water.consumedMl);
  const preview = (message: string) => Alert.alert(copy.previewTitle, message, [{ text: copy.dismiss }]);
  const addWater = () => setWaterMl(current => Math.min(model.water.targetMl, Math.max(0, current) + model.water.portionMl));

  return (
    <Screen scroll edges={['top', 'left', 'right']} testID="today-screen" contentContainerStyle={styles.page}>
      <View style={styles.header} testID="today-header">
        <View style={styles.greeting}>
          <AppText variant="bodySecondary" tone="textSecondary">{copy.greetings[model.greeting]},</AppText>
          <AppText variant="pageTitle">{model.name}</AppText>
          <AppText variant="bodySecondary" tone="textSecondary" style={styles.date}>{format.date(model.date)}</AppText>
        </View>
        <IconButton icon="profile" label={copy.profile} onPress={() => preview(copy.profilePreview)} onLongPress={onOpenDesignSystem} testID="today-profile" />
      </View>
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
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: tokens.spacing.lg },
  greeting: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, gap: tokens.spacing.xs },
  date: { marginTop: tokens.spacing.xs },
});
