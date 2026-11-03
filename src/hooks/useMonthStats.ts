import { useEffect, useState } from 'react';
import { subscribeProductsChangedSince } from '../services/products';
import { computeMonthStats, startOfMonth, type MonthStats } from '../utils/stats';

export function useMonthStats() {
  const [stats, setStats] = useState<MonthStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeProductsChangedSince(
      startOfMonth().getTime(),
      (products) => setStats(computeMonthStats(products)),
      (e) => setError(e.message),
    );
  }, []);

  return { stats, loading: stats === null && !error, error };
}