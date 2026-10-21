import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Text } from 'react-native-paper';
import type { Product } from '../types/product';
import ExpiryBadge from './ExpiryBadge';

interface Props {
  product: Product;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: Props) {
  return (
    <Card mode="outlined" style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        {product.imageUrl ? (
          <Avatar.Image size={44} source={{ uri: product.imageUrl }} />
        ) : (
          <Avatar.Icon size={44} icon="food-apple-outline" />
        )}
        <View style={styles.info}>
          <Text variant="titleMedium">{product.name}</Text>
          {!!product.brand && <Text variant="bodySmall">{product.brand}</Text>}
        </View>
        <ExpiryBadge expiryDate={product.expiryDate} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  info: { flex: 1 },
});