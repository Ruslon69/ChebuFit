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
  onOpenProfile: () => void;
  onOpenDesignSystem?: () => void;
  artwork?: ReactElement;
};

export function TodayHeader({ greeting, name, date, profileLabel, onOpenProfile, onOpenDesignSystem, artwork }: TodayHeaderProps) {
  return (
    <View style={styles.header} testID="today-header">
      <View style={styles.greeting}>
        <AppText variant="bodySecondary" tone="textSecondary">{greeting},</AppText>
        <AppText variant="pageTitle">{name}</AppText>
        <AppText variant="bodySecondary" tone="textSecondary" style={styles.date}>{date}</AppText>
      </View>
      <View style={[styles.aside, artwork && styles.withArtwork]}>
        <IconButton icon="profile" label={profileLabel} onPress={onOpenProfile} onLongPress={onOpenDesignSystem} testID="today-profile" />
        {artwork && (
          <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.artwork}>
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
  // The future illustration shares the profile column; no empty artwork space today.
  withArtwork: { width: '28%' },
  artwork: { width: '100%', aspectRatio: 1 },
  date: { marginTop: tokens.spacing.xs },
});
