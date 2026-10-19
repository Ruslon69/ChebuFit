import { Stack, useLocalSearchParams } from 'expo-router';
import { ExerciseDetailScreen } from '../../features/workouts/ui/ExerciseDetailScreen';
import { getExerciseMessages } from '../../features/workouts/model/messages';
import { appConfig } from '../../shared/config/app';
export default function ExerciseDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <><Stack.Screen options={{ title: getExerciseMessages(appConfig.defaultLocale).exercise }} /><ExerciseDetailScreen id={id} /></>;
}
