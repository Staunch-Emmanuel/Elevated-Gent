// src/lib/firebase/wellness.ts
import { db } from "./firestore";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import type { ArticleDocument } from "@/lib/types/articles";

const COLLECTION = "wellness";

function mapDocToWellness(id: string, data: any): ArticleDocument {
  return {
    id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    heroImage: data.heroImage,
    category: data.category ?? "wellness",
    tag: data.tag,
    datePublished: data.datePublished,
    publishDate: data.publishDate,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    occasion: data.occasion,
  };
}

// LIST
export async function getWellnessArticles(): Promise<ArticleDocument[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => mapDocToWellness(d.id, d.data()));
}

// GET BY ID (admin)
export async function getWellnessById(id: string): Promise<ArticleDocument | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapDocToWellness(snap.id, snap.data());
}

// GET BY SLUG (public)
export async function getWellnessBySlug(
  slug: string
): Promise<ArticleDocument | null> {
  const snap = await getDocs(collection(db, COLLECTION));
  for (const d of snap.docs) {
    const data = d.data();
    if (data.slug === slug) {
      return mapDocToWellness(d.id, data);
    }
  }
  return null;
}

// CREATE
export async function createWellness(
  data: Partial<ArticleDocument>
): Promise<string> {
  const now = new Date().toISOString();

  const payload = {
    slug: data.slug ?? "",
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
    content: data.content ?? "",
    heroImage: data.heroImage ?? "",
    category: data.category ?? "wellness",
    tag: data.tag ?? "",
    datePublished: data.datePublished ?? now,
    publishDate: data.publishDate ?? data.datePublished ?? now,
    createdAt: now,
    updatedAt: now,
    occasion: data.occasion ?? "daily",
  };

  const ref = await addDoc(collection(db, COLLECTION), payload);
  return ref.id;
}

// UPDATE
export async function updateWellness(
  id: string,
  data: Partial<ArticleDocument>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(ref, payload as any);
}

// DELETE
export async function deleteWellness(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}
