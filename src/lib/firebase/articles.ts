// src/lib/firebase/articles.ts
import { db } from "@/lib/firebase/config";
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

function normalizeSlug(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function mapDocToArticle(id: string, data: any): ArticleDocument {
  return {
    id,
    slug: data.slug ?? "",
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
    content: data.content ?? "",
    heroImage: data.heroImage ?? "",
    category: data.category ?? "general",
    tag: data.tag ?? "",
    datePublished: data.datePublished,
    publishDate: data.publishDate,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    occasion: data.occasion,
  };
}

// LIST
export async function getAllArticlesCMS(): Promise<ArticleDocument[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => mapDocToArticle(d.id, d.data()));
}

// GET BY ID
export async function getArticleById(
  id: string
): Promise<ArticleDocument | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return mapDocToArticle(snap.id, snap.data());
}

// ✅ GET BY SLUG (FIXED)
export async function getArticleBySlugCMS(
  slug: string
): Promise<ArticleDocument | null> {
  const target = normalizeSlug(slug);

  const snap = await getDocs(collection(db, COLLECTION));

  for (const d of snap.docs) {
    const data = d.data();
    const docSlug = normalizeSlug(data.slug);

    if (docSlug === target) {
      return mapDocToArticle(d.id, data);
    }
  }

  return null;
}

// CREATE
export async function createArticle(
  data: Partial<ArticleDocument>
): Promise<string> {
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
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// DELETE
export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
