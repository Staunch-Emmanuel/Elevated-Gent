// src/lib/firebase/weekly.ts
"use client";

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export type WeeklyItem = {
  id: string;
  title: string;
  brand: string;
  description: string;
  category: string;
  price: string;
  image: string;
  productLink: string;
  featured?: boolean;
  createdAt?: any;
  updatedAt?: any;
};

const COLLECTION = "weekly";

export async function getAllWeekly(): Promise<WeeklyItem[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => {
    const data = d.data() as Omit<WeeklyItem, "id">;
    return { ...data, id: d.id };
  });
}

export async function getWeeklyById(id: string): Promise<WeeklyItem | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { ...(snap.data() as Omit<WeeklyItem, "id">), id: snap.id };
}

export async function createWeekly(data: Omit<WeeklyItem, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateWeekly(
  id: string,
  data: Partial<Omit<WeeklyItem, "id">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWeekly(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
