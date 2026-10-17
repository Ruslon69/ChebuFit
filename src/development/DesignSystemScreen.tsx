import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { tokens, type ColorRole } from '../shared/theme/tokens';
import { AppText } from '../shared/ui/AppText';
import { Badge } from '../shared/ui/Badge';
import { Button } from '../shared/ui/Button';
import { Card } from '../shared/ui/Card';
import { Divider } from '../shared/ui/Divider';
import { IconButton } from '../shared/ui/IconButton';
import { Metric } from '../shared/ui/Metric';
import { ProgressBar } from '../shared/ui/ProgressBar';
import { Screen } from '../shared/ui/Screen';
import { SectionHeader } from '../shared/ui/SectionHeader';

const swatches = [
  { color: 'background', label: 'Cream' },
  { color: 'surface', label: 'Surface' },
  { color: 'primary', label: 'Orange' },
  { color: 'success', label: 'Green' },
] satisfies { color: ColorRole; label: string }[];

// Internal component samples, not product data. This route is gated by __DEV__.
export function DesignSystemScreen() {
  const [notice, setNotice] = useState('Нажмите на любой активный пример.');
  const [compact, setCompact] = useState(false);
  const demonstrate = () => setNotice('Нажатие работает. Это только пример компонента.');

  return (
    <Screen scroll edges={['left', 'right', 'bottom']} testID="design-system-screen" contentContainerStyle={styles.page}>
      <View style={styles.section} testID="showcase-intro">
        <View style={styles.headingRow}>
          <AppText variant="pageTitle">Компоненты</AppText>
          <IconButton icon="settings" label="Пример кнопки с иконкой" onPress={demonstrate} testID="showcase-icon" />
        </View>
        <AppText variant="bodySecondary" tone="textSecondary">ChebuFit · светлая тема · образцы интерфейса</AppText>
      </View>

      <View style={styles.swatches}>
        {swatches.map(({ color, label }) => (
          <View key={color} style={styles.swatchItem}>
            <View style={[styles.swatch, { backgroundColor: tokens.colors[color] }]} />
            <AppText variant="caption" tone="textSecondary" align="center">{label}</AppText>
          </View>
        ))}
      </View>

      <Card testID="showcase-card">
        <View style={styles.section}>
          <View style={styles.headingRow}>
            <AppText variant="cardTitle">Card / Metric</AppText>
            <Badge label="Готово" tone="positive" />
          </View>
          <Metric label="Пример значения" value="128" unit="ед." description="Крупное значение и спокойная подпись" />
          <ProgressBar value={0.64} label="Пример прогресса" testID="showcase-progress" />
          <AppText variant="caption" tone="textSecondary">64% · определённый прогресс</AppText>
        </View>
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Кнопки" action={{ label: 'Проверить', onPress: demonstrate }} />
        <Button label="Основная" onPress={demonstrate} testID="showcase-primary" />
        <View style={styles.buttonRow}>
          <View style={styles.buttonCell}><Button label="Вторичная" variant="secondary" onPress={demonstrate} /></View>
          <View style={styles.buttonCell}><Button label="Ghost" variant="ghost" onPress={demonstrate} /></View>
        </View>
        <Button label="Недоступно" disabled onPress={demonstrate} testID="showcase-disabled" />
        <AppText variant="caption" tone="textTertiary" accessibilityLiveRegion="polite">{notice}</AppText>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Состояния" />
        <Card>
          <View style={styles.section}>
            <Button label="Загрузка" loading onPress={demonstrate} testID="showcase-loading" />
            <Divider />
            <Button label="Опасное действие" variant="destructive" onPress={demonstrate} testID="showcase-destructive" />
            <ProgressBar value={1} tone="success" label="Завершённый пример" />
            <AppText variant="label" tone="success">Завершено · 100%</AppText>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Типографика" />
        <AppText variant="display">0128</AppText>
        <AppText variant="sectionTitle">Заголовок раздела</AppText>
        <AppText variant="cardTitle">Заголовок карточки</AppText>
        <AppText>Системный шрифт, свободный перенос строк и понятная иерархия.</AppText>
        <AppText variant="bodySecondary" tone="textSecondary">Русский · English · Українська · Nederlands</AppText>
        <AppText variant="label">Подпись</AppText>
        <AppText variant="caption" tone="textTertiary">Вспомогательный текст без жёсткой высоты.</AppText>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Компактная ширина" />
        <Button label={compact ? 'Развернуть пример' : 'Показать узкий пример'} variant="secondary" onPress={() => setCompact(value => !value)} testID="showcase-compact-toggle" />
        <View style={[styles.preview, compact && styles.compact]} testID="showcase-compact-preview">
          <Card>
            <View style={styles.section}>
              <AppText variant="cardTitle">Длинные подписи остаются читаемыми</AppText>
              <AppText tone="textSecondary">Контент растёт по высоте, а не выходит за границы.</AppText>
              <Button label="Продолжить с длинной подписью" onPress={demonstrate} />
              <Metric label="Значение с единицей" value="12 345,6" unit="единиц" />
            </View>
          </Card>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: tokens.spacing.section },
  section: { gap: tokens.spacing.md },
  headingRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacing.sm },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.lg },
  swatchItem: { flex: 1, minWidth: tokens.size.swatch, alignItems: 'center', gap: tokens.spacing.xs },
  swatch: { width: tokens.size.swatch, height: tokens.size.swatch, borderRadius: tokens.radii.small, borderWidth: tokens.stroke.thin, borderColor: tokens.colors.border },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  buttonCell: { flexGrow: 1, flexBasis: '45%', minWidth: 0 },
  preview: { width: '100%', alignSelf: 'center' },
  compact: { maxWidth: tokens.layout.compactWidth - tokens.spacing.page * 2 },
});
