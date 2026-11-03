import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Chip, Text, TextInput } from 'react-native-paper';
import RecipeCard from '../components/RecipeCard';
import { useActiveProducts } from '../hooks/useProducts';
import { findRecipes } from '../services/mealdb';
import type { RecipeMatch } from '../types/recipe';

export default function RecipesScreen() {
  const navigation = useNavigation();
  const { products } = useActiveProducts();

  const [selected, setSelected] = useState<string[]>([]);
  const [extra, setExtra] = useState('');
  const [results, setResults] = useState<RecipeMatch[] | null>(null); // null = no search yet
  const [searchedCount, setSearchedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One keyword per product, soonest-expiring first (they're already sorted)
  const fridgeKeywords = useMemo(() => {
    const seen = new Set<string>();
    for (const p of products) {
      const keyword = (p.ingredient || p.name).trim().toLowerCase();
      if (keyword) seen.add(keyword);
    }
    return [...seen];
  }, [products]);

  // Fridge keywords + anything typed by hand
  const chips = [...new Set([...fridgeKeywords, ...selected])];

  const toggle = (keyword: string) =>
    setSelected((current) =>
      current.includes(keyword) ? current.filter((k) => k !== keyword) : [...current, keyword],
    );

  const addExtra = () => {
    const keyword = extra.trim().toLowerCase();
    if (keyword && !selected.includes(keyword)) setSelected([...selected, keyword]);
    setExtra('');
  };

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      setResults(await findRecipes(selected));
      setSearchedCount(new Set(selected).size);
    } catch {
      setError('Could not reach TheMealDB. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text variant="titleMedium">Pick ingredients</Text>
        <Button icon="heart" onPress={() => navigation.navigate('Favourites')}>
          Favourites
        </Button>
      </View>

      {chips.length === 0 && <Text>Add products to your fridge, or type an ingredient below.</Text>}

      <View style={styles.chips}>
        {chips.map((keyword) => (
          <Chip
            key={keyword}
            selected={selected.includes(keyword)}
            showSelectedCheck
            onPress={() => toggle(keyword)}
          >
            {keyword}
          </Chip>
        ))}
      </View>

      <TextInput
        mode="outlined"
        dense
        label="Add an ingredient (English)"
        value={extra}
        onChangeText={setExtra}
        onSubmitEditing={addExtra}
        autoCapitalize="none"
        right={<TextInput.Icon icon="plus" onPress={addExtra} />}
      />

      <Button
        mode="contained"
        icon="magnify"
        onPress={search}
        loading={loading}
        disabled={selected.length === 0 || loading}
      >
        Find recipes
      </Button>

      {error && <Text style={styles.error}>{error}</Text>}
      {!!results?.length && <Text variant="bodySmall">{results.length} recipes, best matches first</Text>}
    </View>
  );

  return (
    <FlatList
      data={results ?? []}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <RecipeCard
          recipe={item}
          totalSearched={searchedCount}
          onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id, title: item.title })}
        />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={
        results ? (
          <Text style={styles.empty}>
            No recipes found. Try simpler words like "chicken", "egg" or "rice".
          </Text>
        ) : null
      }
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, paddingBottom: 32 },
  header: { gap: 12, marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { gap: 4 },
  error: { color: '#C62828' },
  empty: { textAlign: 'center', marginTop: 24 },
});