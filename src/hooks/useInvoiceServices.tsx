import { db } from "@/lib/firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";

export async function addRecord<T extends object>(
  collectionName: string,
  payload: T,
) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateRecord<T extends object>(
  collectionName: string,
  id: string,
  payload: Partial<T>,
) {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export const deleteRecord = async (
  collectionName: string,
  invoiceId: string,
) => {
  try {
    await deleteDoc(doc(db, collectionName, invoiceId));
    toast.success("Record deleted successfully");
  } catch (error) {
    console.error("Error deleting record:", error);
    toast.error("Error deleting record");
    throw error;
  }
};
