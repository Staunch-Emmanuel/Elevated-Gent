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
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import type { Product } from "@/lib/products/types";

const COLLECTION = "weekly";

/**
 * Some parts of the app call weekly items "WeeklyItem"
 * but they are basically Products in your project.
 */
export type WeeklyItem = Product & {
  id: string;
  createdAt?: any;
  updatedAt?: any;
};

/* ------------------ READ (ALL) ------------------ */
/** Used by: Admin weekly (expects getAllWeekly) */
export async function getAllWeekly(): Promise<WeeklyItem[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      ...(data as Product),
      id: d.id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

/** Used by: Protected weekly + outfit inspiration (expects getWeeklyProducts) */
export async function getWeeklyProducts(): Promise<Product[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as Product;
    return {
      ...data,
      id: d.id,
    };
  });
}

/* ------------------ READ (BY ID) ------------------ */
export async function getWeeklyById(id: string): Promise<WeeklyItem | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;

  const data = snap.data() as any;

  return {
    ...(data as Product),
    id: snap.id,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/** Backwards compatibility: some files call this name */
export async function getWeeklyProductById(id: string): Promise<Product | null> {
  const item = await getWeeklyById(id);
  if (!item) return null;
  const { createdAt, updatedAt, ...rest } = item as any;
  return rest as Product;
}

/* ------------------ CREATE ------------------ */
/** Backwards compatibility: your earlier file used createWeeklyProduct */
export async function createWeeklyProduct(input: Product): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Admin pages tend to expect createWeekly */
export async function createWeekly(input: Product): Promise<string> {
  return createWeeklyProduct(input);
}

/* ------------------ UPDATE ------------------ */
/** Backwards compatibility */
export async function updateWeeklyProduct(
  id: string,
  data: Partial<Product>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateWeekly(
  id: string,
  data: Partial<Product>
): Promise<void> {
  return updateWeeklyProduct(id, data);
}

/* ------------------ DELETE ------------------ */
/** Backwards compatibility */
export async function deleteWeeklyProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function deleteWeekly(id: string): Promise<void> {
  return deleteWeeklyProduct(id);
}
