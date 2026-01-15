"use client";

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";

/* =======================
   TYPES
======================= */

export interface WellnessItem {
  id: string;

  title: string;
  slug: string;

  excerpt?: string;
  content?: string;

  category?: string;
  heroImage?: string;

  published?: boolean;

  createdAt?: any;
  updatedAt?: any;
}

/* =======================
   PUBLIC (READ)
======================= */

export async function getWellnessItems(): Promise<WellnessItem[]> {
  const q = query(
    collection(db, "wellness"),
    where("published", "==", true)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<WellnessItem, "id">),
  }));
}

/* =======================
   ADMIN (READ)
======================= */

export async function getWellnessById(
  id: string
): Promise<WellnessItem | null> {
  const ref = doc(db, "wellness", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as Omit<WellnessItem, "id">),
  };
}

/* =======================
   ADMIN (CREATE)
======================= */

export async function createWellness(
  data: Omit<WellnessItem, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, "wellness"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

/* =======================
   ADMIN (UPDATE)
======================= */

export async function updateWellness(
  id: string,
  data: Partial<WellnessItem>
): Promise<void> {
  const ref = doc(db, "wellness", id);

  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/* =======================
   ADMIN (DELETE)
======================= */

export async function deleteWellness(id: string): Promise<void> {
  const ref = doc(db, "wellness", id);
  await deleteDoc(ref);
}
