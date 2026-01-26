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
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";

const COLLECTION = "wellness";

export type WellnessItem = {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  heroImage?: string;
  content?: string;
  createdAt?: any;
  updatedAt?: any;
};

/** LIST */
export async function getWellnessItems(): Promise<WellnessItem[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as any;

    return {
      id: d.id,
      title: data.title ?? "",
      slug: data.slug ?? "",
      excerpt: data.excerpt ?? "",
      heroImage: data.heroImage ?? "",
      content: data.content ?? "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

/** GET BY ID (Admin edit page expects this) */
export async function getWellnessById(id: string): Promise<WellnessItem | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;

  const data = snap.data() as any;

  return {
    id: snap.id,
    title: data.title ?? "",
    slug: data.slug ?? "",
    excerpt: data.excerpt ?? "",
    heroImage: data.heroImage ?? "",
    content: data.content ?? "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/** GET BY SLUG (Protected slug page expects this) */
export async function getWellnessItemBySlug(
  slug: string
): Promise<WellnessItem | null> {
  const normalized = (slug || "").trim().toLowerCase();

  const q = query(
    collection(db, COLLECTION),
    where("slug", "==", normalized),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const d = snap.docs[0];
  const data = d.data() as any;

  return {
    id: d.id,
    title: data.title ?? "",
    slug: data.slug ?? "",
    excerpt: data.excerpt ?? "",
    heroImage: data.heroImage ?? "",
    content: data.content ?? "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/** CREATE */
export async function createWellness(
  input: Omit<WellnessItem, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    slug: (input.slug ?? "").trim().toLowerCase(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

/** UPDATE (Admin edit page expects this) */
export async function updateWellness(
  id: string,
  data: Partial<Omit<WellnessItem, "id">>
): Promise<void> {
  const payload: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (typeof data.slug === "string") {
    payload.slug = data.slug.trim().toLowerCase();
  }

  await updateDoc(doc(db, COLLECTION, id), payload);
}

/** DELETE (Admin edit page expects this) */
export async function deleteWellness(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
