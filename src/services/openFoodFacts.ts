/** What we keep from Open Food Facts. */
export interface ScannedProductInfo {
  name: string;
  brand?: string;
  imageUrl?: string;
}

/** The part of the API response we use. */
interface OffResponse {
  status: number; // 1 = found, 0 = not found
  product?: {
    product_name?: string;
    brands?: string; // e.g. "Ferrero, Nutella"
    image_front_url?: string;
    image_front_small_url?: string;
  };
}

const BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';
const FIELDS = 'product_name,brands,image_front_url,image_front_small_url';

/**
 * Looks up a barcode.
 * Returns null if the product isn't in the database,
 * throws if the network fails.
 */
export async function fetchProductByBarcode(barcode: string): Promise<ScannedProductInfo | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000); // give up after 10 s

  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`, {
      headers: { 'User-Agent': 'SmartFridge/1.0 (student project)' },
      signal: controller.signal,
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Open Food Facts error ${res.status}`);

    const json = (await res.json()) as OffResponse;
    if (json.status !== 1 || !json.product) return null;

    const p = json.product;
    return {
      name: p.product_name?.trim() ?? '',
      brand: p.brands?.split(',')[0]?.trim() || undefined, // keep the first brand
      imageUrl: p.image_front_url || p.image_front_small_url || undefined,
    };
  } finally {
    clearTimeout(timeout);
  }
}