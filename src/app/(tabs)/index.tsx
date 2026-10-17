import { router } from 'expo-router';

import { todayMock } from '../../features/today/model/todayMock';
import { TodayScreen } from '../../features/today/ui/TodayScreen';

export default function TodayRoute() {
  return (
    <TodayScreen
      model={todayMock}
      onOpenNutrition={() => router.navigate('/nutrition')}
      onOpenProgress={() => router.navigate('/progress')}
      onOpenDesignSystem={__DEV__ ? () => router.push('/design-system') : undefined}
    />
  );
}
