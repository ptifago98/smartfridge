import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { expiryColors } from '../theme';
import { expiryLabel, getExpiryStatus } from '../utils/expiry';

interface Props {
  expiryDate: string;
}

export default function ExpiryBadge({ expiryDate }: Props) {
  const colors = expiryColors[getExpiryStatus(expiryDate)];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.fg }]}>{expiryLabel(expiryDate)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  text: { fontSize: 13, fontWeight: '600' },
});