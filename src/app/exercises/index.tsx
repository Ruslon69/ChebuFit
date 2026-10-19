import { Stack } from 'expo-router';
import { ExerciseCatalogScreen } from '../../features/workouts/ui/ExerciseCatalogScreen';
import { getExerciseMessages } from '../../features/workouts/model/messages';
import { appConfig } from '../../shared/config/app';
export default function ExercisesRoute() {
  return <><Stack.Screen options={{ title: getExerciseMessages(appConfig.defaultLocale).catalog }} /><ExerciseCatalogScreen /></>;
}
