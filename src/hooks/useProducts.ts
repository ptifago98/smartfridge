import { useEffect, useState } from 'react';
import { subscribeActiveProducts } from '../services/products';
import type { Product } from '../types/product';

export function useActiveProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeActiveProducts(
      (list) => {
        setProducts(list);
        
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );
    return unsubscribe; // ← stops listening when the screen unmounts
  }, []);

  return { products, loading, error };
}