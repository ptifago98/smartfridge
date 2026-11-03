import {
  addDoc, collection, deleteDoc, doc, getDoc, onSnapshot,
  query, updateDoc, where, type Unsubscribe,
} from 'firebase/firestore';
import type { NewProduct, Product, ProductStatus } from '../types/product';
import { deleteField } from 'firebase/firestore';               
import { cancelReminder, scheduleExpiryReminder } from './notifications';
import { auth, db } from './firebase';

/** users/{uid}/products */
function productsRef() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  return collection(db, 'users', uid, 'products');
}

export async function addProduct(data: NewProduct): Promise<string> {
  const ref = await addDoc(productsRef(), { ...data, status: 'active', createdAt: Date.now() });

  const notificationId = await scheduleExpiryReminder({
    productId: ref.id,
    name: data.name,
    expiryDate: data.expiryDate,
  });
  if (notificationId) await updateDoc(ref, { notificationId });

  return ref.id;
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(productsRef(), id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
}

export async function updateProduct(id: string, changes: Partial<NewProduct>) {
  const current = await getProduct(id);
  if (!current) throw new Error('Product not found');

  await cancelReminder(current.notificationId);
  const notificationId = await scheduleExpiryReminder({
    productId: id,
    name: changes.name ?? current.name,
    expiryDate: changes.expiryDate ?? current.expiryDate,
  });

  await updateDoc(doc(productsRef(), id), {
    ...changes,
    notificationId: notificationId ?? deleteField(),
  });
}

export async function setProductStatus(id: string, status: ProductStatus) {
  const current = await getProduct(id);
  await cancelReminder(current?.notificationId);   // eaten or thrown: no reminder needed
  await updateDoc(doc(productsRef(), id), {
    status,
    statusChangedAt: Date.now(),
    notificationId: deleteField(),
  });
}

export async function deleteProduct(id: string) {
  const current = await getProduct(id);
  await cancelReminder(current?.notificationId);
  await deleteDoc(doc(productsRef(), id));
}

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