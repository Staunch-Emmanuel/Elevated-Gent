// src/lib/firebase/outfits.ts
'use client';

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
} from 'firebase/firestore';

import { db } from './firebase';

const COLLECTION = 'outfits';

/**
 * Input type when creating/updating an outfit from Admin
 * (what your forms work with)
 */
export interface OutfitInput {
  title: string;
  description: string;
  heroImage: string;
  gallery?: string[];        // multiple images (optional)
  occasion: string;
  season: string;
  styleType: string;
  products: string[];        // array of product IDs (Weekly products)
  totalPrice: number;
  featured?: boolean;

  // slug + ordering
  slug?: string;
  sortWeight?: number;
}

/**
 * What is actually stored in Firestore
 */
export interface OutfitDocument extends OutfitInput {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  sortWeight?: number;

  viewCount?: number;
  clickCount?: number;
  lastViewedAt?: string;
  lastClickedAt?: string;
}

/* Helpers */

function nowIso(): string {
  return new Date().toISOString();
}

function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Map Firestore → OutfitDocument (always safe + filled)
 */
function mapDocToOutfit(id: string, data: any): OutfitDocument {
  const createdAt = data.createdAt || nowIso();
  const updatedAt = data.updatedAt || createdAt;

  return {
    id,
    title: data.title || '',
    description: data.description || '',
    heroImage: data.heroImage || '',
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    occasion: data.occasion || '',
    season: data.season || '',
    styleType: data.styleType || '',
    products: Array.isArray(data.products) ? data.products : [],
    totalPrice: typeof data.totalPrice === 'number' ? data.totalPrice : 0,
    featured: !!data.featured,
    slug: data.slug || slugify(data.title || id),
    sortWeight: typeof data.sortWeight === 'number' ? data.sortWeight : 0,
    createdAt,
    updatedAt,
    viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
    clickCount: typeof data.clickCount === 'number' ? data.clickCount : 0,
    lastViewedAt: data.lastViewedAt || undefined,
    lastClickedAt: data.lastClickedAt || undefined,
  };
}

/* CREATE */

export async function createOutfit(input: OutfitInput): Promise<string> {
  const colRef = collection(db, COLLECTION);
  const now = nowIso();

  const payload: Omit<OutfitDocument, 'id'> = {
    title: input.title,
    description: input.description,
    heroImage: input.heroImage,
    gallery: input.gallery ?? [],
    occasion: input.occasion,
    season: input.season,
    styleType: input.styleType,
    products: input.products ?? [],
    totalPrice: input.totalPrice ?? 0,
    featured: input.featured ?? false,
    slug: input.slug || slugify(input.title),
    sortWeight: input.sortWeight ?? 0,
    createdAt: now,
    updatedAt: now,
    viewCount: 0,
    clickCount: 0,
    lastViewedAt: undefined,
    lastClickedAt: undefined,
  };

  const res = await addDoc(colRef, payload as any);
  return res.id;
}

/* READ – admin list */

export async function getAllOutfits(): Promise<OutfitDocument[]> {
  const colRef = collection(db, COLLECTION);
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => mapDocToOutfit(d.id, d.data()));
}

/* READ – public list (same as admin but kept separate if you ever want filters) */

export async function getAllOutfitsPublic(): Promise<OutfitDocument[]> {
  return getAllOutfits();
}

/* READ – by ID (admin edit) */

export async function getOutfitById(id: string): Promise<OutfitDocument | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapDocToOutfit(snap.id, snap.data());
}

/* READ – by slug (public detail page) */

export async function getOutfitBySlug(slug: string): Promise<OutfitDocument | null> {
  const colRef = collection(db, COLLECTION);
  const snap = await getDocs(colRef);

  for (const docSnap of snap.docs) {
    const data: any = docSnap.data();
    const docSlug = data.slug || slugify(data.title || docSnap.id);
    if (docSlug === slug) {
      return mapDocToOutfit(docSnap.id, data);
    }
  }

  return null;
}

/* UPDATE */

export async function updateOutfit(
  id: string,
  input: Partial<OutfitInput>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);

  const payload: any = {
    ...input,
    updatedAt: nowIso(),
  };

  if (input.title && !input.slug) {
    payload.slug = slugify(input.title);
  }

  if (input.gallery && !Array.isArray(input.gallery)) {
    payload.gallery = [input.gallery];
  }

  await updateDoc(ref, payload);
}

/* DELETE */

export async function deleteOutfit(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}

/* ANALYTICS HELPERS */

export async function incrementOutfitView(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    viewCount: increment(1),
    lastViewedAt: nowIso(),
  });
}

export async function incrementOutfitClick(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    clickCount: increment(1),
    lastClickedAt: nowIso(),
  });
}
