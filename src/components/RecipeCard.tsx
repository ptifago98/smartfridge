import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import type { Recipe } from '../types/recipe';

interface Props {
  recipe: Recipe;
  totalSearched?: number;
  onPress: () => void;
}

export default function RecipeCard({ recipe, totalSearched, onPress }: Props) {
  const used = recipe.usedIngredients?.length ?? 0;
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Cover source={{ uri: recipe.imageUrl }} style={styles.cover} />
      <Card.Content style={styles.content}>
        <Text variant="titleSmall" numberOfLines={2}>
          {recipe.title}
        </Text>
        {!!totalSearched && used > 0 && (
          <Text variant="bodySmall" style={styles.uses}>
            Uses {used}/{totalSearched}: {recipe.usedIngredients?.join(', ')}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, margin: 4, maxWidth: '50%' },
  cover: { height: 110 },
  content: { paddingTop: 8, gap: 2 },
  uses: { color: '#2E7D4F' },
});