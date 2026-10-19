import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { exerciseCatalog } from '../../../application/workouts/exerciseCatalog';
import { appConfig } from '../../../shared/config/app';
import { tokens as t } from '../../../shared/theme/tokens';
import { AppText } from '../../../shared/ui/AppText';
import { Card } from '../../../shared/ui/Card';
import { Icon } from '../../../shared/ui/Icon';
import { Screen } from '../../../shared/ui/Screen';
import { getExerciseMessages } from '../model/messages';
export function WorkoutsScreen() {
  const copy = getExerciseMessages(appConfig.defaultLocale), router = useRouter();
  return <Screen scroll edges={['left', 'right']} contentContainerStyle={styles.content} testID="workouts-screen">
    <Card><View style={styles.section}>
      <AppText variant="sectionTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{copy.yourWorkouts}</AppText>
      <AppText tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{copy.foundation}</AppText>
    </View></Card>
    <Pressable accessibilityRole="button" accessibilityLabel={`${copy.catalog}. ${copy.catalogHint}`} onPress={() => router.push('/exercises')} testID="workouts-exercises" style={({ pressed }) => pressed && { opacity: t.opacity.pressed }}>
      <Card><View style={styles.link}>
        <View style={styles.icon}><Icon name="workouts" color={t.colors.primaryText} /></View>
        <View style={styles.flex}>
          <AppText variant="cardTitle" maxFontSizeMultiplier={t.accessibility.headingTextScale}>{copy.catalog}</AppText>
          <AppText variant="bodySecondary" tone="textSecondary" maxFontSizeMultiplier={t.accessibility.bodyTextScale}>{exerciseCatalog.getAll().length} · {copy.catalogHint}</AppText>
        </View>
        <Icon name="chevron" size="small" />
      </View></Card>
    </Pressable>
  </Screen>;
}
const styles = StyleSheet.create({
  content: { gap: t.spacing.lg }, section: { gap: t.spacing.sm }, flex: { flex: 1, gap: t.spacing.xs },
  link: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
  icon: { width: t.size.touchTarget, height: t.size.touchTarget, borderRadius: t.radii.control, backgroundColor: t.colors.primarySubtle, alignItems: 'center', justifyContent: 'center' },
});
