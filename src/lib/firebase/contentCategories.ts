import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'

import { db } from '@/lib/firebase/config'
import type { ProductCategory } from '@/lib/products/types'

const COLLECTION = 'contentCategories'

export type ContentCategorySection = 'weekly' | 'outfits' | 'articles'

const DEFAULT_CATEGORIES: Record<ContentCategorySection, ProductCategory[]> = {
  weekly: [
    {
      id: 'finds-of-the-week',
      name: 'Finds of the Week',
      slug: 'finds-of-the-week',
      section: 'weekly',
    },
    {
      id: 'deals-of-the-week',
      name: 'Deals of the Week',
      slug: 'deals-of-the-week',
      section: 'weekly',
    },
    {
      id: 'fashion-on-a-budget',
      name: 'Fashion on a Budget',
      slug: 'fashion-on-a-budget',
      section: 'weekly',
    },
    {
      id: 'high-roller-list',
      name: 'High Roller List',
      slug: 'high-roller-list',
      section: 'weekly',
    },
    {
      id: 'best-accessories',
      name: 'Best Accessories',
      slug: 'best-accessories',
      section: 'weekly',
    },
    {
      id: 'emerging-brand-spotlight',
      name: 'Emerging Brand Spotlight',
      slug: 'emerging-brand-spotlight',
      section: 'weekly',
    },
    {
      id: 'closet-staples',
      name: 'Closet Staples',
      slug: 'closet-staples',
      section: 'weekly',
    },
    {
      id: 'marks-investment-pieces',
      name: "Mark's Investment Pieces",
      slug: 'marks-investment-pieces',
      section: 'weekly',
    },
  ],
  outfits: [
    {
      id: 'casual-style',
      name: 'Casual Style',
      slug: 'casual-style',
      section: 'outfits',
    },
    {
      id: 'formal-wear',
      name: 'Formal Wear',
      slug: 'formal-wear',
      section: 'outfits',
    },
    {
      id: 'streetwear',
      name: 'Streetwear',
      slug: 'streetwear',
      section: 'outfits',
    },
    {
      id: 'date-night',
      name: 'Date Night',
      slug: 'date-night',
      section: 'outfits',
    },
    {
      id: 'weddings-events',
      name: 'Weddings/Events',
      slug: 'weddings-events',
      section: 'outfits',
    },
    {
      id: 'weekend',
      name: 'Weekend',
      slug: 'weekend',
      section: 'outfits',
    },
    {
      id: 'marks-favorites',
      name: "Mark's Favorites",
      slug: 'marks-favorites',
      section: 'outfits',
    },
  ],
  articles: [
    {
      id: 'general',
      name: 'General',
      slug: 'general',
      section: 'articles',
    },
    {
      id: 'wellness',
      name: 'Wellness',
      slug: 'wellness',
      section: 'articles',
    },
    {
      id: 'style',
      name: 'Style',
      slug: 'style',
      section: 'articles',
    },
    {
      id: 'grooming',
      name: 'Grooming',
      slug: 'grooming',
      section: 'articles',
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle',
      slug: 'lifestyle',
      section: 'articles',
    },
  ],
}

export function slugifyCategoryName(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeTimestamp(value: any): string | undefined {
  if (!value) return undefined

  if (typeof value === 'string') return value

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString()
  }

  return undefined
}

function normalizeCategoryDoc(
  id: string,
  data: any,
  fallbackSection?: ContentCategorySection
): ProductCategory | null {
  const name = String(data?.name ?? '').trim()
  const section = String(
    data?.section ?? fallbackSection ?? ''
  ).trim() as ContentCategorySection
  const slug = slugifyCategoryName(String(data?.slug ?? name))

  if (!name || !slug || !section) return null

  return {
    id,
    name,
    slug,
    description:
      typeof data?.description === 'string' ? data.description.trim() : undefined,
    section,
    createdAt: normalizeTimestamp(data?.createdAt),
    updatedAt: normalizeTimestamp(data?.updatedAt),
  }
}

async function getAllStoredCategories(): Promise<ProductCategory[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy('name', 'asc'))
  )

  return snap.docs
    .map((item) => normalizeCategoryDoc(item.id, item.data()))
    .filter((item): item is ProductCategory => Boolean(item))
}

function mergeSectionCategories(
  section: ContentCategorySection,
  stored: ProductCategory[]
): ProductCategory[] {
  const merged = new Map<string, ProductCategory>()

  for (const item of DEFAULT_CATEGORIES[section]) {
    merged.set(item.slug, { ...item })
  }

  for (const item of stored) {
    if (item.section !== section) continue

    const existing = merged.get(item.slug)
    merged.set(item.slug, {
      ...(existing || {}),
      ...item,
      section,
    })
  }

  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getContentCategories(
  section: ContentCategorySection
): Promise<ProductCategory[]> {
  try {
    const stored = await getAllStoredCategories()
    return mergeSectionCategories(section, stored)
  } catch (error) {
    console.error(`Failed to load ${section} categories from Firestore:`, error)
    return [...DEFAULT_CATEGORIES[section]].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }
}

export async function createContentCategory(input: {
  name: string
  description?: string
  section: ContentCategorySection
}): Promise<string> {
  const name = String(input.name || '').trim()
  if (!name) {
    throw new Error('Category name is required.')
  }

  const slug = slugifyCategoryName(name)
  if (!slug) {
    throw new Error('Invalid category name.')
  }

  const existing = await getContentCategories(input.section)
  const duplicate = existing.find((item) => item.slug === slug)

  if (duplicate) {
    throw new Error('A category with this name already exists.')
  }

  const payload = {
    name,
    slug,
    description: String(input.description || '').trim(),
    section: input.section,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const ref = await addDoc(collection(db, COLLECTION), payload)
  return ref.id
}

export async function updateContentCategory(
  id: string,
  input: {
    name?: string
    description?: string
  }
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  }

  if (input.name !== undefined) {
    const trimmedName = String(input.name).trim()

    if (!trimmedName) {
      throw new Error('Category name is required.')
    }

    payload.name = trimmedName
    payload.slug = slugifyCategoryName(trimmedName)
  }

  if (input.description !== undefined) {
    payload.description = String(input.description).trim()
  }

  await updateDoc(doc(db, COLLECTION, id), payload)
}

export async function deleteContentCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}