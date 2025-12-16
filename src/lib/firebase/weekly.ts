// NO "use client" — this file must be usable on server + client

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
} from 'firebase/firestore'

import { db } from './firebase'
import type { Product } from '@/lib/products/types'

const COLLECTION = 'weekly'

// CMS Weekly item = Product + extra CMS fields
export interface WeeklyItem extends Product {
  slug?: string
  createdAt?: string
  updatedAt?: string
  sortWeight?: number

  viewCount?: number
  clickCount?: number
  lastViewedAt?: string
  lastClickedAt?: string

  images?: string[] // extra gallery images
}

// --- utils --- //

function nowIso(): string {
  return new Date().toISOString()
}

function createSlug(title: string, fallback: string): string {
  const base = title && title.trim().length > 0 ? title : fallback
  return base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Map Firestore doc → WeeklyItem (CMS shape) */
function mapDocToWeekly(id: string, data: any): WeeklyItem {
  const createdAt = data.createdAt || nowIso()
  const updatedAt = data.updatedAt || createdAt

  const productBase: Product = {
    id,
    title: data.title || '',
    brand: data.brand || '',
    description: data.description || '',
    image: data.image || '',
    price: data.price || '',
    originalPrice: data.originalPrice || '',
    category: data.category || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    productLink: data.productLink || '',
    affiliateLink: data.affiliateLink || '',
    featured: Boolean(data.featured),
    inStock: data.inStock ?? true,
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    colors: Array.isArray(data.colors) ? data.colors : [],
  }

  const images: string[] = Array.isArray(data.images) ? data.images : []

  return {
    ...productBase,
    images,
    slug: data.slug || createSlug(productBase.title, id),
    createdAt,
    updatedAt,
    sortWeight:
      typeof data.sortWeight === 'number' ? data.sortWeight : 0,
    viewCount:
      typeof data.viewCount === 'number' ? data.viewCount : 0,
    clickCount:
      typeof data.clickCount === 'number' ? data.clickCount : 0,
    lastViewedAt: data.lastViewedAt || undefined,
    lastClickedAt: data.lastClickedAt || undefined,
  }
}

// --- CREATE --- //

export async function createWeekly(
  input: Omit<WeeklyItem, 'id'>
): Promise<string> {
  const colRef = collection(db, COLLECTION)
  const now = nowIso()

  const payload: Omit<WeeklyItem, 'id'> = {
    ...input,
    slug: input.slug || createSlug(input.title, ''),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
    sortWeight:
      typeof input.sortWeight === 'number' ? input.sortWeight : 0,
    viewCount:
      typeof input.viewCount === 'number' ? input.viewCount : 0,
    clickCount:
      typeof input.clickCount === 'number' ? input.clickCount : 0,
    lastViewedAt: input.lastViewedAt,
    lastClickedAt: input.lastClickedAt,
    images: Array.isArray(input.images) ? input.images : [],
  }

  const res = await addDoc(colRef, payload as any)
  return res.id
}

// --- READ (ADMIN) --- //

export async function getAllWeekly(): Promise<WeeklyItem[]> {
  const colRef = collection(db, COLLECTION)
  const snap = await getDocs(colRef)
  return snap.docs.map((d) => mapDocToWeekly(d.id, d.data()))
}

export async function getWeeklyById(
  id: string
): Promise<WeeklyItem | null> {
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return mapDocToWeekly(snap.id, snap.data())
}

// --- READ (PUBLIC) → return Product[] --- //

export async function getWeeklyProducts(): Promise<Product[]> {
  const items = await getAllWeekly()

  // Strip CMS-only fields, return pure Product shape for frontend
  return items.map<Product>((item) => ({
    id: item.id,
    title: item.title,
    brand: item.brand,
    description: item.description,
    image: item.image,
    price: item.price,
    originalPrice: item.originalPrice,
    category: item.category,
    tags: item.tags,
    productLink: item.productLink,
    affiliateLink: item.affiliateLink,
    featured: item.featured,
    inStock: item.inStock,
    sizes: item.sizes,
    colors: item.colors,
  }))
}

// --- UPDATE --- //

export async function updateWeekly(
  id: string,
  input: Partial<WeeklyItem>
): Promise<void> {
  const ref = doc(db, COLLECTION, id)

  const payload: any = {
    ...input,
    updatedAt: nowIso(),
  }

  if (input.title && !input.slug) {
    payload.slug = createSlug(input.title, id)
  }

  if (input.images && !Array.isArray(input.images)) {
    payload.images = []
  }

  await updateDoc(ref, payload)
}

// --- DELETE --- //

export async function deleteWeekly(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id)
  await deleteDoc(ref)
}

// --- Analytics helpers (optional) --- //

export async function incrementWeeklyView(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, {
    viewCount: increment(1),
    lastViewedAt: nowIso(),
  })
}

export async function incrementWeeklyClick(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, {
    clickCount: increment(1),
    lastClickedAt: nowIso(),
  })
}
