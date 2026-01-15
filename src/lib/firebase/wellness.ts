// src/lib/firebase/wellness.ts
"use client";

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export type WellnessItem = {
  id: string;
  title: string;
  slug?: string;
  content: string;
  createdAt?: any;
  updatedAt?: any;
};

const COLLECTION = "wellness";

export async function getWellnessItems(): Promise<WellnessItem[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => {
    const data = d.data() as Omit<WellnessItem, "id">;
    return { ...data, id: d.id };
  });
}

export async function getWellnessItemById(id: string): Promise<WellnessItem | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { ...(snap.data() as Omit<WellnessItem, "id">), id: snap.id };
}

export async function getWellnessItemBySlug(slug: string): Promise<WellnessItem | null> {
  const q = query(collection(db, COLLECTION), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const d = snapshot.docs[0];
  const data = d.data() as Omit<WellnessItem, "id">;
  return { ...data, id: d.id };
}

export async function createWellness(data: Omit<WellnessItem, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateWellness(
  id: string,
  data: Partial<Omit<WellnessItem, "id">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWellness(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
