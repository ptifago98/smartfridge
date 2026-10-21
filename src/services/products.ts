import {
  addDoc, collection, deleteDoc, doc, getDoc, onSnapshot,
  query, updateDoc, where, type Unsubscribe,
} from 'firebase/firestore';
import type { NewProduct, Product, ProductStatus } from '../types/product';
import { auth, db } from './firebase';

/** users/{uid}/products */
function productsRef() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  return collection(db, 'users', uid, 'products');
}

export async function addProduct(data: NewProduct): Promise<string> {
  const ref = await addDoc(productsRef(), {
    ...data,
    status: 'active',
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(productsRef(), id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
}

export function updateProduct(id: string, changes: Partial<NewProduct>) {
  return updateDoc(doc(productsRef(), id), changes);
}

export function setProductStatus(id: string, status: ProductStatus) {
  return updateDoc(doc(productsRef(), id), { status, statusChangedAt: Date.now() });
}

export function deleteProduct(id: string) {
  return deleteDoc(doc(productsRef(), id));
}

/** Live list of active products, sorted by expiry date. */
export function subscribeActiveProducts(
  onData: (products: Product[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(productsRef(), where('status', '==', 'active'));
  return onSnapshot(
    q,
    (snap) => {
      const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
      products.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
      onData(products);
    },
    onError,
  );
}

/** Live single product (null if deleted). */
export function subscribeProduct(id: string, onData: (product: Product | null) => void): Unsubscribe {
  return onSnapshot(doc(productsRef(), id), (snap) =>
    onData(snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null),
  );
}