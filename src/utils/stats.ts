import type { Product } from '../types/product';
import { getExpiryStatus } from './expiry';

/** Midnight on the 1st of the current month. */
export function startOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export interface MonthStats {
  consumed: number;
  thrown: number;
  total: number;
  /** 0 to 1: share of products eaten rather than thrown */
  consumedRate: number;
}

/** Counts consumed vs thrown among products whose status changed this month. */
export function computeMonthStats(products: Product[]): MonthStats {
  const consumed = products.filter((p) => p.status === 'consumed').length;
  const thrown = products.filter((p) => p.status === 'thrown').length;
  const total = consumed + thrown;
  return { consumed, thrown, total, consumedRate: total === 0 ? 0 : consumed / total };
}

export interface FridgeOverview {
  total: number;
  soon: number;
  expired: number;
}

/** What's in the fridge right now, by colour. */
export function computeFridgeOverview(activeProducts: Product[]): FridgeOverview {
  let soon = 0;
  let expired = 0;
  for (const p of activeProducts) {
    const status = getExpiryStatus(p.expiryDate);
    if (status === 'soon') soon++;
    if (status === 'expired') expired++;
  }
  return { total: activeProducts.length, soon, expired };
}

/** A short encouraging sentence for the stats card. */
export function wasteMessage(rate: number): string {
  if (rate >= 0.9) return 'Amazing, almost zero waste!';
  if (rate >= 0.7) return 'Good job, keep it up!';
  if (rate >= 0.5) return 'Not bad. Check the orange badges more often.';
  return 'Lots of waste this month. Try the recipe ideas!';
}