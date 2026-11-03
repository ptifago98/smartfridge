import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import ExpiryBadge from '../components/ExpiryBadge';
import type { RootStackScreenProps } from '../navigation/types';
import { deleteProduct, setProductStatus, subscribeProduct } from '../services/products';
import type { Product, ProductStatus } from '../types/product';
import { fromISODate } from '../utils/expiry';
import { logScheduledReminders, scheduleTestReminder } from '../services/notifications';


export default function ProductDetailScreen({ navigation, route }: RootStackScreenProps<'ProductDetail'>) {
  const { productId } = route.params;
  // undefined = still loading, null = not found
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => subscribeProduct(productId, setProduct), [productId]);

  if (product === undefined) return <ActivityIndicator style={styles.loading} size="large" />;
  if (product === null) return <Text style={styles.loading}>Product not found.</Text>;

  const markAs = async (status: ProductStatus) => {
    await setProductStatus(product.id, status);
    navigation.goBack();
  };

  const confirmDelete = () => {
    Alert.alert('Delete product?', `"${product.name}" will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          navigation.goBack();
          deleteProduct(product.id);
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product.imageUrl && <Image source={{ uri: product.imageUrl }} style={styles.image} />}

      <View style={styles.header}>
        <View style={styles.title}>
          <Text variant="headlineSmall">{product.name}</Text>
          {!!product.brand && <Text variant="bodyMedium">{product.brand}</Text>}
        </View>
        <ExpiryBadge expiryDate={product.expiryDate} />
      </View>

      <Text>Expires on {fromISODate(product.expiryDate).toLocaleDateString()}</Text>
      {!!product.barcode && <Text>Barcode: {product.barcode}</Text>}

      <>
    <Button icon="bell-ring-outline" onPress={() => scheduleTestReminder(product.name)}>
      Test reminder (10 s)
    </Button>
    <Button icon="format-list-bulleted" onPress={logScheduledReminders}>
      Log scheduled reminders
    </Button>
  </>

      <Button mode="contained" icon="check" onPress={() => markAs('consumed')}>
        Consumed
      </Button>
      <Button mode="contained-tonal" icon="delete-variant" onPress={() => markAs('thrown')}>
        Thrown away
      </Button>
      <Button
        mode="outlined"
        icon="pencil"
        onPress={() => navigation.navigate('ProductForm', { productId: product.id })}
      >
        Edit
      </Button>
      <Button textColor="#C62828" icon="trash-can-outline" onPress={confirmDelete}>
        Delete
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  loading: { marginTop: 48, textAlign: 'center' },
  image: { width: '100%', height: 200, borderRadius: 12, resizeMode: 'contain' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1 },
});