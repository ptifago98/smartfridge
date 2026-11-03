import type { Recipe, RecipeDetails, RecipeIngredient, RecipeMatch } from '../types/recipe';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/** The fields filter.php returns for each meal. */
interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string | null;
}

/** lookup.php returns ~50 string fields, many of them null. */
type MealFull = Record<string, string | null | undefined>;

/** Results already fetched in this session: "chicken" → recipes. */
const cache = new Map<string, Recipe[]>();

/** "Chicken Breast " → "chicken_breast" (TheMealDB's format) */
function normalize(ingredient: string): string {
  return ingredient.trim().toLowerCase().replace(/\s+/g, '_');
}

async function getJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`TheMealDB error ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/** All recipes containing ONE ingredient. */
export async function searchByIngredient(ingredient: string): Promise<Recipe[]> {
  const key = normalize(ingredient);
  if (!key) return [];

  const cached = cache.get(key);
  if (cached) return cached;

  const json = (await getJson(`${BASE_URL}/filter.php?i=${encodeURIComponent(key)}`)) as {
    meals?: unknown;
  };
  // Anything that isn't a list (null, a message, ...) means "no results"
  const meals = Array.isArray(json.meals) ? (json.meals as MealSummary[]) : [];

  const recipes: Recipe[] = meals.map((m) => ({
    id: m.idMeal,
    title: m.strMeal,
    imageUrl: m.strMealThumb ?? undefined,
  }));
  cache.set(key, recipes);
  return recipes;
}

/**
 * Recipes for SEVERAL ingredients (the free API only does one at a time).
 * Runs one search per ingredient in parallel, merges them, and ranks
 * recipes using the most selected ingredients first.
 */
export async function findRecipes(ingredients: string[]): Promise<RecipeMatch[]> {
  const unique = [...new Set(ingredients.map((i) => i.trim().toLowerCase()).filter(Boolean))];
  const lists = await Promise.all(unique.map(searchByIngredient));

  const byId = new Map<string, RecipeMatch>();
  lists.forEach((list, index) => {
    for (const recipe of list) {
      const match = byId.get(recipe.id) ?? { ...recipe, usedIngredients: [] };
      match.usedIngredients.push(unique[index]);
      byId.set(recipe.id, match);
    }
  });

  return [...byId.values()].sort(
    (a, b) => b.usedIngredients.length - a.usedIngredients.length || a.title.localeCompare(b.title),
  );
}

/** Full recipe, or null if the id doesn't exist. */
export async function getRecipeDetails(id: string): Promise<RecipeDetails | null> {
  const json = (await getJson(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`)) as {
    meals?: unknown;
  };
  const meal = Array.isArray(json.meals) ? (json.meals[0] as MealFull | undefined) : undefined;
  if (!meal) return null;

  // Ingredients are spread over 20 numbered fields
  const ingredients: RecipeIngredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim();
    if (name) ingredients.push({ name, measure: meal[`strMeasure${i}`]?.trim() ?? '' });
  }

  return {
    id: meal.idMeal ?? id,
    title: meal.strMeal ?? '',
    imageUrl: meal.strMealThumb ?? undefined,
    sourceUrl: meal.strSource || undefined,
    category: meal.strCategory ?? undefined,
    area: meal.strArea ?? meal.strCountry ?? undefined,
    instructions: (meal.strInstructions ?? '').replace(/\r/g, ''),
    youtubeUrl: meal.strYoutube || undefined,
    ingredients,
  };
}