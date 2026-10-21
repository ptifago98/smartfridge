import type { ExpiryStatus } from '../types/product';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const SOON_DAYS = 3;

/** Date → 'YYYY-MM-DD' (local time) */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0'); // months start at 0!
  const d = String(date.getDate()).padStart(2, '0');
  return `${d}-${m}-${y}`;
}

/** 'YYYY-MM-DD' → Date at local midnight */
export function fromISODate(iso: string): Date {
  const [d, m, y] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days until expiry. 0 = today, negative = expired. */
export function daysUntil(expiryDate: string, today = new Date()): number {
  const start = fromISODate(toISODate(today)); // today at midnight
  const end = fromISODate(expiryDate);
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

/** green / orange / red */
export function getExpiryStatus(expiryDate: string, today = new Date()): ExpiryStatus {
  const days = daysUntil(expiryDate, today);
  if (days < 0) return 'expired';
  if (days <= SOON_DAYS) return 'soon';
  return 'fine';
}

/** Badge text */
export function expiryLabel(expiryDate: string, today = new Date()): string {
  const days = daysUntil(expiryDate, today);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  return days === 1 ? '1 day' : `${days} days`;
}