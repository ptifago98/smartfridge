/** The life of a product in the fridge. */
export type ProductStatus = 'active' | 'consumed' | 'thrown';

/** Colour category of the expiry badge: green / orange / red. */
export type ExpiryStatus = 'fine' | 'soon' | 'expired';

/**
 * A product saved in Firestore at users/{uid}/products/{id}.
 */
export interface Product {
  /** Firestore document id */
  id: string;
  name: string;
  brand?: string;
  ingredient?: string;
  /** EAN barcode, missing for manual entries */
  barcode?: string;
  /** Picture from Open Food Facts */
  imageUrl?: string;
  /** 'YYYY-MM-DD': sorts correctly and avoids time-zone bugs */
  expiryDate: string;
  status: ProductStatus;
  /** When it was added (ms since 1970, from Date.now()) */
  createdAt: number;
  /** When it was marked consumed or thrown (for the monthly stats) */
  statusChangedAt?: number;
  /** Id of the scheduled reminder, so it can be cancelled (week 4) */
  notificationId?: string;
}

/**
 * What the add form provides.
 * id comes from Firestore; createdAt and status are set by the code.
 */
export type NewProduct = Omit<Product, 'id' | 'createdAt' | 'status'>;