import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore'

import { db } from '@/lib/firebase/config'
import type { ProductCategory } from '@/lib/products/types'

const COLLECTION = 'contentCategories'

export type ContentCategorySection = 'weekly' | 'outfits' | 'articles'

type StoredContentCategory = ProductCategory & {
  replacesDefaultSlug?: string
}

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

function normalizeTimestamp(value: unknown): string | undefined {
  if (!value) return undefined

  if (typeof value === 'string') return value

  if (typeof (value as { toDate?: () => Date })?.toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString()
  }

  return undefined
}

function normalizeCategoryDoc(
  id: string,
  data: any,
  fallbackSection?: ContentCategorySection
): StoredContentCategory | null {
  const name = String(data?.name ?? '').trim()
  const section = String(
    data?.section ?? fallbackSection ?? ''
  ).trim() as ContentCategorySection
  const slug = slugifyCategoryName(String(data?.slug ?? name))
  const replacesDefaultSlug =
    typeof data?.replacesDefaultSlug === 'string'
      ? slugifyCategoryName(data.replacesDefaultSlug)
      : undefined

  if (!name || !slug || !section) return null

  return {
    id,
    name,
    slug,
    description:
      typeof data?.description === 'string' ? data.description.trim() : undefined,
    section,
    replacesDefaultSlug: replacesDefaultSlug || undefined,
    createdAt: normalizeTimestamp(data?.createdAt),
    updatedAt: normalizeTimestamp(data?.updatedAt),
  }
}

async function getAllStoredCategories(): Promise<StoredContentCategory[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy('name', 'asc'))
  )

  return snap.docs
    .map((item) => normalizeCategoryDoc(item.id, item.data()))
    .filter((item): item is StoredContentCategory => Boolean(item))
}

function mergeSectionCategories(
  section: ContentCategorySection,
  stored: StoredContentCategory[]
): ProductCategory[] {
  const merged = new Map<string, ProductCategory>()

  for (const item of DEFAULT_CATEGORIES[section]) {
    merged.set(item.slug, { ...item })
  }

  for (const item of stored) {
    if (item.section !== section) continue

    if (item.replacesDefaultSlug) {
      merged.delete(item.replacesDefaultSlug)
    }

    const existing = merged.get(item.slug)

    merged.set(item.slug, {
      ...(existing || {}),
      ...item,
      section,
    })
  }

  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
}

async function findStoredCategoryById(
  id: string
): Promise<StoredContentCategory | null> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), where('__name__', '==', id), limit(1))
  )

  const first = snap.docs[0]
  if (!first) return null

  return normalizeCategoryDoc(first.id, first.data())
}

async function findStoredCategoryBySlug(
  section: ContentCategorySection,
  slug: string
): Promise<StoredContentCategory | null> {
  const normalizedSlug = slugifyCategoryName(slug)

  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where('section', '==', section),
      where('slug', '==', normalizedSlug),
      limit(1)
    )
  )

  const first = snap.docs[0]
  if (!first) return null

  return normalizeCategoryDoc(first.id, first.data(), section)
}

function getDefaultCategoryByIdOrSlug(
  section: ContentCategorySection,
  value: string
): ProductCategory | null {
  const normalized = String(value || '').trim().toLowerCase()

  return (
    DEFAULT_CATEGORIES[section].find(
      (item) =>
        item.id.toLowerCase() === normalized || item.slug.toLowerCase() === normalized
    ) || null
  )
}

function getContentCollectionsForSection(section: ContentCategorySection): string[] {
  if (section === 'weekly') return ['weekly']
  if (section === 'outfits') return ['outfits', 'outfitInspiration']
  return ['articles']
}

async function updateCategoryReferences(input: {
  section: ContentCategorySection
  previousName: string
  previousSlug: string
  nextName: string
  nextSlug: string
}): Promise<void> {
  const previousName = input.previousName.trim()
  const previousSlug = slugifyCategoryName(input.previousSlug)
  const nextName = input.nextName.trim()
  const nextSlug = slugifyCategoryName(input.nextSlug)

  if (!previousName || !previousSlug || !nextName || !nextSlug) return

  if (previousName === nextName && previousSlug === nextSlug) return

  const collections = getContentCollectionsForSection(input.section)
  const updates: Array<{
    ref: DocumentReference
    category: string
  }> = []

  for (const collectionName of collections) {
    const byNameSnap = await getDocs(
      query(collection(db, collectionName), where('category', '==', previousName))
    )

    byNameSnap.docs.forEach((item) => {
      updates.push({
        ref: item.ref,
        category: nextName,
      })
    })

    if (previousSlug !== previousName) {
      const bySlugSnap = await getDocs(
        query(collection(db, collectionName), where('category', '==', previousSlug))
      )

      bySlugSnap.docs.forEach((item) => {
        updates.push({
          ref: item.ref,
          category: nextName,
        })
      })
    }
  }

  const uniqueUpdates = new Map<
    string,
    {
      ref: DocumentReference
      category: string
    }
  >()

  updates.forEach((item) => {
    uniqueUpdates.set(item.ref.path, item)
  })

  const items = Array.from(uniqueUpdates.values())

  for (let index = 0; index < items.length; index += 450) {
    const batch = writeBatch(db)
    const chunk = items.slice(index, index + 450)

    chunk.forEach((item) => {
      batch.update(item.ref, {
        category: item.category,
        updatedAt: serverTimestamp(),
      })
    })

    await batch.commit()
  }
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
  const name = String(input.name ?? '').trim()
  const description = String(input.description ?? '').trim()
  const section = input.section
  const slug = slugifyCategoryName(name)

  if (!name) {
    throw new Error('Category name is required.')
  }

  if (!slug) {
    throw new Error('Category slug is invalid.')
  }

  const existing = await findStoredCategoryBySlug(section, slug)

  if (existing) {
    throw new Error('A category with this name already exists in this section.')
  }

  const defaultCategory = getDefaultCategoryByIdOrSlug(section, slug)

  if (defaultCategory) {
    throw new Error('A category with this name already exists in this section.')
  }

  const ref = await addDoc(collection(db, COLLECTION), {
    name,
    slug,
    description: description || '',
    section,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}

export async function updateContentCategory(
  id: string,
  input: {
    name: string
    description?: string
    section: ContentCategorySection
  }
): Promise<void> {
  const section = input.section
  const name = String(input.name ?? '').trim()
  const description = String(input.description ?? '').trim()
  const slug = slugifyCategoryName(name)

  if (!name) {
    throw new Error('Category name is required.')
  }

  if (!slug) {
    throw new Error('Category slug is invalid.')
  }

  let targetDoc = await findStoredCategoryById(id)
  let replacesDefaultSlug = targetDoc?.replacesDefaultSlug
  let previousName = targetDoc?.name || ''
  let previousSlug = targetDoc?.slug || ''

  if (!targetDoc) {
    targetDoc = await findStoredCategoryBySlug(section, id)

    if (targetDoc) {
      previousName = targetDoc.name
      previousSlug = targetDoc.slug
      replacesDefaultSlug = targetDoc.replacesDefaultSlug
    }
  }

  if (!targetDoc) {
    const defaultCategory = getDefaultCategoryByIdOrSlug(section, id)

    if (defaultCategory) {
      previousName = defaultCategory.name
      previousSlug = defaultCategory.slug
      replacesDefaultSlug = defaultCategory.slug
      targetDoc = await findStoredCategoryBySlug(section, defaultCategory.slug)

      if (!targetDoc) {
        const ref = await addDoc(collection(db, COLLECTION), {
          name: defaultCategory.name,
          slug: defaultCategory.slug,
          description: defaultCategory.description || '',
          section,
          replacesDefaultSlug: defaultCategory.slug,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        targetDoc = {
          id: ref.id,
          name: defaultCategory.name,
          slug: defaultCategory.slug,
          description: defaultCategory.description,
          section,
          replacesDefaultSlug: defaultCategory.slug,
        }
      }
    }
  }

  const duplicate = await findStoredCategoryBySlug(section, slug)

  if (duplicate && duplicate.id !== targetDoc?.id) {
    throw new Error('Another category with this name already exists in this section.')
  }

  const defaultDuplicate = getDefaultCategoryByIdOrSlug(section, slug)

  if (
    defaultDuplicate &&
    defaultDuplicate.slug !== replacesDefaultSlug &&
    defaultDuplicate.id !== id
  ) {
    throw new Error('Another category with this name already exists in this section.')
  }

  if (!targetDoc) {
    const ref = await addDoc(collection(db, COLLECTION), {
      name,
      slug,
      description: description || '',
      section,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    await updateDoc(doc(db, COLLECTION, ref.id), {
      name,
      slug,
      description: description || '',
      section,
      updatedAt: serverTimestamp(),
    })

    return
  }

  previousName = previousName || targetDoc.name
  previousSlug = previousSlug || targetDoc.slug

  await updateDoc(doc(db, COLLECTION, targetDoc.id), {
    name,
    slug,
    description: description || '',
    section,
    replacesDefaultSlug: replacesDefaultSlug || targetDoc.replacesDefaultSlug || '',
    updatedAt: serverTimestamp(),
  })

  await updateCategoryReferences({
    section,
    previousName,
    previousSlug,
    nextName: name,
    nextSlug: slug,
  })
}

export async function deleteContentCategory(id: string): Promise<void> {
  const stored = await findStoredCategoryById(id)

  if (!stored) {
    throw new Error(
      'This category exists only as a built-in default and cannot be deleted directly.'
    )
  }

  await deleteDoc(doc(db, COLLECTION, id))
}