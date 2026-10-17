import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { tokens } from '../../../shared/theme/tokens';
import { AppText } from '../../../shared/ui/AppText';
import { IconButton } from '../../../shared/ui/IconButton';

type TodayHeaderProps = {
  greeting: string;
  name: string;
  date: string;
  profileLabel: string;
  orangeBalance: string;
  orangeBalanceLabel: string;
  onOpenProfile: () => void;
  onOpenDesignSystem?: () => void;
  artwork?: ReactElement;
};

export function TodayHeader({ greeting, name, date, profileLabel, orangeBalance, orangeBalanceLabel, onOpenProfile, onOpenDesignSystem, artwork }: TodayHeaderProps) {
  return (
    <View style={styles.header} testID="today-header">
      <View style={styles.greeting}>
        <AppText variant="bodySecondary" tone="textSecondary">{greeting},</AppText>
        <AppText variant="pageTitle">{name}</AppText>
        <AppText variant="bodySecondary" tone="textSecondary" style={styles.date}>{date}</AppText>
        <View accessible accessibilityLabel={orangeBalanceLabel} style={styles.wallet} testID="today-orange-wallet">
          <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.orangeMark}>
            <View style={styles.orangeFruit} />
            <View style={styles.orangeLeaf} />
          </View>
          <AppText variant="label" tone="primaryText" accessible={false}>{orangeBalance}</AppText>
        </View>
      </View>
      <View style={[styles.aside, artwork && styles.withArtwork]}>
        <IconButton icon="profile" label={profileLabel} onPress={onOpenProfile} onLongPress={onOpenDesignSystem} testID="today-profile" />
        {artwork && (
          <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.artwork} testID="today-mascot-container">
            {artwork}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: tokens.spacing.lg },
  greeting: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, gap: tokens.spacing.xs },
  aside: { alignItems: 'flex-end', gap: tokens.spacing.sm },
  // Bound the decorative column on larger screens without fixing the text width.
  withArtwork: { width: '28%', maxWidth: tokens.size.floatingControl * 2 },
  artwork: { width: '100%', aspectRatio: 1 },
  date: { marginTop: tokens.spacing.xs },
  wallet: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', maxWidth: '100%', gap: tokens.spacing.sm, marginTop: tokens.spacing.sm, paddingVertical: tokens.spacing.sm, paddingHorizontal: tokens.spacing.md, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.primarySubtle },
  orangeMark: { width: tokens.spacing.xl, height: tokens.spacing.xl },
  orangeFruit: { position: 'absolute', left: 0, bottom: 0, width: tokens.size.iconSmall, height: tokens.size.iconSmall, borderRadius: tokens.radii.pill, backgroundColor: tokens.colors.primary },
  orangeLeaf: { position: 'absolute', right: 0, top: 0, width: tokens.spacing.sm, height: tokens.spacing.xs, borderTopLeftRadius: tokens.radii.pill, borderBottomRightRadius: tokens.radii.pill, backgroundColor: tokens.colors.success },
});
