// src/lib/firebase/articles.ts
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

const COLLECTION = "articles";

function mapDocToArticle(id: string, data: any): ArticleDocument {
  return {
    id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    heroImage: data.heroImage,
    category: data.category,
    tag: data.tag,
    datePublished: data.datePublished,
    publishDate: data.publishDate,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    occasion: data.occasion,
  };
}

// LIST (admin + public merge)
export async function getAllArticlesCMS(): Promise<ArticleDocument[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => mapDocToArticle(d.id, d.data()));
}

// GET BY ID (admin edit)
export async function getArticleById(id: string): Promise<ArticleDocument | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapDocToArticle(snap.id, snap.data());
}

// GET BY SLUG (public detail)
export async function getArticleBySlugCMS(
  slug: string
): Promise<ArticleDocument | null> {
  const snap = await getDocs(collection(db, COLLECTION));
  for (const d of snap.docs) {
    const data = d.data();
    if (data.slug === slug) {
      return mapDocToArticle(d.id, data);
    }
  }
  return null;
}

// CREATE
export async function createArticle(data: Partial<ArticleDocument>): Promise<string> {
  const now = new Date().toISOString();

  const payload = {
    slug: data.slug ?? "",
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
    content: data.content ?? "",
    heroImage: data.heroImage ?? "",
    category: data.category ?? "general",
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
export async function updateArticle(
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
export async function deleteArticle(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}
