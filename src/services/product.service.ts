import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
  where,
  limit,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Product } from "@/types/product.types";
import { addRecord, updateRecord } from "@/hooks/useInvoiceServices";
const PRODUCTS_COLLECTION = "products";

function mapProductDocs(
  snapshot: QuerySnapshot<DocumentData, DocumentData>,
): Product[] {
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

export async function checkBarcodeExists(barcodeNumber: string) {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where("barcodeNumber", "==", barcodeNumber),
    limit(1),
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}

export async function createProduct(
  product: Omit<Product, "id" | "createdAt" | "updatedAt">,
) {
  return addRecord(PRODUCTS_COLLECTION, product);
}

/*
|--------------------------------------------------------------------------
| Get Products
|--------------------------------------------------------------------------
*/

export async function getProducts(): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return mapProductDocs(snapshot);
}

export function subscribeToProducts(
  onProducts: (products: Product[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onProducts(mapProductDocs(snapshot));
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function updateProduct(id: string, product: Partial<Product>) {
  await updateRecord(PRODUCTS_COLLECTION, id, product);
}

export async function deleteProduct(id: string) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function deleteMultipleProducts(ids: string[]) {
  const batch = writeBatch(db);
  ids.forEach((id) => {
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    batch.delete(ref);
  });
  await batch.commit();
}
