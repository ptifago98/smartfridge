import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, IconButton, Text } from 'react-native-paper';
import type { RootStackScreenProps } from '../navigation/types';
import { addFavourite, removeFavourite, subscribeIsFavourite } from '../services/favourites';
import { getRecipeDetails } from '../services/mealdb';
import type { RecipeDetails } from '../types/recipe';

export default function RecipeDetailScreen({ navigation, route }: RootStackScreenProps<'RecipeDetail'>) {
  const { recipeId, title } = route.params;
  const [recipe, setRecipe] = useState<RecipeDetails | null | undefined>(undefined); // undefined = loading
  const [error, setError] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setRecipe(undefined);
    getRecipeDetails(recipeId)
      .then(setRecipe)
      .catch(() => setError(true));
  }, [recipeId]);

  useEffect(load, [load]);

  // Live: the heart updates if the favourite changes anywhere
  useEffect(() => subscribeIsFavourite(recipeId, setIsFavourite), [recipeId]);

  const toggleFavourite = useCallback(() => {
    if (!recipe) return;
    if (isFavourite) removeFavourite(recipe.id);
    else addFavourite(recipe);
  }, [recipe, isFavourite]);

  // Heart button in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: title ?? 'Recipe',
      headerRight: () => (
        <IconButton
          icon={isFavourite ? 'heart' : 'heart-outline'}
          iconColor="#C62828"
          onPress={toggleFavourite}
          disabled={!recipe}
        />
      ),
    });
  }, [navigation, title, isFavourite, toggleFavourite, recipe]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Could not load this recipe.</Text>
        <Button onPress={load}>Try again</Button>
      </View>
    );
  }
  if (recipe === undefined) return <ActivityIndicator style={styles.center} size="large" />;
  if (recipe === null) return <Text style={styles.center}>Recipe not found.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {recipe.imageUrl && <Image source={{ uri: recipe.imageUrl }} style={styles.image} />}

      <Text variant="headlineSmall">{recipe.title}</Text>
      <View style={styles.tags}>
        {recipe.category && <Chip compact>{recipe.category}</Chip>}
        {recipe.area && <Chip compact>{recipe.area}</Chip>}
      </View>

      <Text variant="titleMedium">Ingredients</Text>
      {recipe.ingredients.map((ing, index) => (
        <Text key={`${ing.name}-${index}`}>
          • {ing.measure ? `${ing.measure} ` : ''}
          {ing.name}
        </Text>
      ))}

      <Text variant="titleMedium">Instructions</Text>
      <Text style={styles.instructions}>{recipe.instructions}</Text>

      {recipe.youtubeUrl && (
        <Button mode="contained" icon="youtube" onPress={() => Linking.openURL(recipe.youtubeUrl!)}>
          Watch on YouTube
        </Button>
      )}
      {recipe.sourceUrl && (
        <Button mode="outlined" icon="open-in-new" onPress={() => Linking.openURL(recipe.sourceUrl!)}>
          Original recipe
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 48 },
  image: { width: '100%', height: 220, borderRadius: 12 },
  tags: { flexDirection: 'row', gap: 8 },
  instructions: { lineHeight: 22 },
});