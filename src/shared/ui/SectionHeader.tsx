import { StyleSheet, View } from 'react-native';

import { tokens } from '../theme/tokens';
import { AppText } from './AppText';
import { Button, type ButtonProps } from './Button';

type SectionHeaderProps = { title: string; action?: Pick<ButtonProps, 'label' | 'onPress' | 'accessibilityLabel'> };

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="sectionTitle" style={styles.title}>{title}</AppText>
      {action && <Button {...action} variant="ghost" />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: tokens.spacing.sm },
  title: { flexGrow: 1, flexBasis: '50%' },
});
