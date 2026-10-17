import { StyleSheet, View } from 'react-native';

import { tokens } from '../theme/tokens';

export function Divider() {
  return <View accessible={false} style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: tokens.colors.divider },
});
