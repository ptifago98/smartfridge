import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import RecipeCard from '../components/RecipeCard';
import { useFavourites } from '../hooks/useFavourites';
import type { RootStackScreenProps } from '../navigation/types';

export default function FavouritesScreen({ navigation }: RootStackScreenProps<'Favourites'>) {
  const { favourites, loading, error } = useFavourites();

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <FlatList
      data={favourites}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <RecipeCard
          recipe={item}
          onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id, title: item.title })}
        />
      )}
      ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text variant="titleMedium">No favourites yet</Text>
          <Text>Tap ♥ on a recipe to save it here.</Text>
        </View>
      }
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  list: { padding: 12 },
  row: { gap: 4 },
  empty: { alignItems: 'center', marginTop: 48, gap: 4 },
  error: { color: '#C62828', marginBottom: 8 },
});