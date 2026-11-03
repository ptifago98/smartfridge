/** A recipe in a list (search result or favourite). */
export interface Recipe {
  /** TheMealDB id ("idMeal"), also the Firestore document id for favourites */
  id: string;
  title: string;
  imageUrl?: string;
  /** Link to the original recipe website */
  sourceUrl?: string;
  /** Selected ingredients this recipe uses */
  usedIngredients?: string[];
}

/** A search result: always knows which ingredients matched. */
export interface RecipeMatch extends Recipe {
  usedIngredients: string[];
}

export interface RecipeIngredient {
  name: string;
  measure: string; // e.g. "3/4 cup"
}

/** Everything shown on the detail screen. */
export interface RecipeDetails extends Recipe {
  category?: string;
  area?: string;
  instructions: string;
  youtubeUrl?: string;
  ingredients: RecipeIngredient[];
  ingredient?: string;
}

/** Saved at users/{uid}/favourites/{id}. */
export interface FavouriteRecipe extends Recipe {
  savedAt: number;
}