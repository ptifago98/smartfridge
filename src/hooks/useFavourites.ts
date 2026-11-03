import { useEffect, useState } from 'react';
import { subscribeFavourites } from '../services/favourites';
import type { FavouriteRecipe } from '../types/recipe';

export function useFavourites() {
  const [favourites, setFavourites] = useState<FavouriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeFavourites(
      (list) => {
        setFavourites(list);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );
  }, []);

  return { favourites, loading, error };
}