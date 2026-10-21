import { useIsFocused, useNavigation } from '@react-navigation/native';   // 🆕 useIsFocused
import { useState } from 'react';                                        // 🆕
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, Text } from 'react-native-paper';
import ProductCard from '../components/ProductCard';
import { useActiveProducts } from '../hooks/useProducts';

export default function FridgeScreen() {
  const navigation = useNavigation();
  const { products, loading, error } = useActiveProducts();
  const [fabOpen, setFabOpen] = useState(false);                         // 🆕
  const isFocused = useIsFocused();                                      // 🆕

  if (loading) {
    return <ActivityIndicator style={styles.center} size="large" />;
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="titleMedium">Your fridge is empty</Text>
            <Text>Tap + to add your first product.</Text>
          </View>
        }
      />

      {/* 🆕 Replaces the old <FAB />: last element, so it's drawn on top of the list */}
      <FAB.Group
        open={fabOpen}
        visible={isFocused}
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          { icon: 'barcode-scan', label: 'Scan barcode', onPress: () => navigation.navigate('Scanner') },
          { icon: 'pencil', label: 'Enter manually', onPress: () => navigation.navigate('ProductForm') },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1 },
  list: { padding: 16, paddingBottom: 96 },
  empty: { alignItems: 'center', marginTop: 48, gap: 4 },
  error: { color: '#C62828', padding: 16 },
  // 🆕 the "fab" style is removed: FAB.Group positions itself
});