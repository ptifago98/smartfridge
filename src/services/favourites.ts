import { collection, deleteDoc, doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import type { FavouriteRecipe, Recipe } from '../types/recipe';
import { auth, db } from './firebase';

/** users/{uid}/favourites */
function favouritesRef() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  return collection(db, 'users', uid, 'favourites');
}

/** Saves a recipe. The recipe id is used as the document id, so no duplicates. */
export function addFavourite(recipe: Recipe) {
  const favourite: FavouriteRecipe = {
    id: recipe.id,
    title: recipe.title,
    imageUrl: recipe.imageUrl,
    savedAt: Date.now(),
  };
  return setDoc(doc(favouritesRef(), recipe.id), favourite);
}

export function removeFavourite(recipeId: string) {
  return deleteDoc(doc(favouritesRef(), recipeId));
}

/** Live list, most recently saved first. */
export function subscribeFavourites(
  onData: (favourites: FavouriteRecipe[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    favouritesRef(),
    (snap) => {
      const list = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as FavouriteRecipe);
      list.sort((a, b) => b.savedAt - a.savedAt);
      onData(list);
    },
    onError,
  );
}

/** Live true/false for one recipe (drives the heart icon). */
export function subscribeIsFavourite(recipeId: string, onData: (isFavourite: boolean) => void): Unsubscribe {
  return onSnapshot(doc(favouritesRef(), recipeId), (snap) => onData(snap.exists()));
}