'use client'

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  updateDoc,
} from 'firebase/firestore'

import { db } from '@/lib/firebase/config'
import type { ShoppableLink } from '@/lib/products/types'

const COLLECTION = 'outfits'

export interface OutfitShopItem {
  id: string
  name: string
  brand: string
  url: string
  imageUrl: string
  category: string
  price?: string
  sortOrder?: number
}

export interface OutfitInput {
  title: string
  description: string
  heroImage: string
  galleryImages?: string[]
  category: string
  productLinks: Array<string | ShoppableLink>
  shopItems?: OutfitShopItem[]
  featured?: boolean
  slug?: string
  sortWeight?: number
  published?: boolean
}

export interface OutfitDocument extends OutfitInput {
  id: string
  createdAt?: string
  updatedAt?: string
  viewCount?: number
  clickCount?: number
  lastViewedAt?: string
  lastClickedAt?: string
}

function nowIso(): string {
  return new Date().toISOString()
}

function slugify(text: string): string {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeLinks(value: unknown): Array<string | ShoppableLink> {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') {
        const url = item.trim()
        return url ? url : null
      }

      if (
        item &&
        typeof item === 'object' &&
        typeof (item as { url?: unknown }).url === 'string'
      ) {
        const url = (item as { url: string }).url.trim()
        const rawLabel =
          typeof (item as { label?: unknown }).label === 'string'
            ? (item as { label: string }).label.trim()
            : ''

        if (!url) return null

        return {
          label: rawLabel || url,
          url,
        }
      }

      return null
    })
    .filter((item): item is string | ShoppableLink => Boolean(item))
}

function sanitizeShopItems(value: unknown): OutfitShopItem[] {
  if (!Array.isArray(value)) return []

  const items: OutfitShopItem[] = []

  value.forEach((item, index) => {
    if (!item || typeof item !== 'object') return

    const raw = item as Record<string, unknown>

    const id =
      typeof raw.id === 'string' && raw.id.trim()
        ? raw.id.trim()
        : `shop-item-${index + 1}`

    const name =
      typeof raw.name === 'string'
        ? raw.name.trim()
        : typeof raw.title === 'string'
          ? raw.title.trim()
          : ''

    const brand =
      typeof raw.brand === 'string'
        ? raw.brand.trim()
        : typeof raw.store === 'string'
          ? raw.store.trim()
          : ''

    const url =
      typeof raw.url === 'string'
        ? raw.url.trim()
        : typeof raw.link === 'string'
          ? raw.link.trim()
          : ''

    const imageUrl =
      typeof raw.imageUrl === 'string'
        ? raw.imageUrl.trim()
        : typeof raw.image === 'string'
          ? raw.image.trim()
          : ''

    const category =
      typeof raw.category === 'string'
        ? raw.category.trim()
        : typeof raw.type === 'string'
          ? raw.type.trim()
          : ''

    const price =
      typeof raw.price === 'string'
        ? raw.price.trim()
        : typeof raw.price === 'number'
          ? String(raw.price)
          : ''

    const sortOrder =
      typeof raw.sortOrder === 'number'
        ? raw.sortOrder
        : typeof raw.sortOrder === 'string'
          ? Number(raw.sortOrder) || index
          : index

    if (!name && !url && !imageUrl) return

    const nextItem: OutfitShopItem = {
      id,
      name,
      brand,
      url,
      imageUrl,
      category,
      sortOrder,
    }

    if (price) {
      nextItem.price = price
    }

    items.push(nextItem)
  })

  return items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

function shopItemsToLegacyLinks(shopItems: OutfitShopItem[]): ShoppableLink[] {
  return shopItems
    .filter((item) => item.url.trim())
    .map((item) => ({
      label: item.name || item.brand || item.url,
      url: item.url,
    }))
}

function sanitizeCategory(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function mapLegacyCategory(data: any): string {
  if (typeof data.category === 'string' && data.category.trim()) {
    return data.category.trim()
  }

  if (typeof data.occasion === 'string' && data.occasion.trim()) {
    return data.occasion.trim()
  }

  return ''
}

function mapDocToOutfit(id: string, data: any): OutfitDocument {
  const createdAt = data.createdAt || nowIso()
  const updatedAt = data.updatedAt || createdAt

  const shopItems = sanitizeShopItems(data.shopItems)

  return {
    id,
    title: data.title || '',
    description: data.description || '',
    heroImage: data.heroImage || data.imageUrl || '',
    galleryImages: Array.isArray(data.gallery) ? data.gallery : [],
    category: mapLegacyCategory(data),
    productLinks: sanitizeLinks(
      Array.isArray(data.productLinks) ? data.productLinks : data.links
    ),
    shopItems,
    featured: !!data.featured,
    slug: data.slug || slugify(data.title || id),
    sortWeight: typeof data.sortWeight === 'number' ? data.sortWeight : 0,
    published: typeof data.published === 'boolean' ? data.published : true,
    createdAt,
    updatedAt,
    viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
    clickCount: typeof data.clickCount === 'number' ? data.clickCount : 0,
    lastViewedAt: data.lastViewedAt || undefined,
    lastClickedAt: data.lastClickedAt || undefined,
  }
}

export async function createOutfit(input: OutfitInput): Promise<string> {
  const now = nowIso()
  const shopItems = sanitizeShopItems(input.shopItems || [])
  const productLinks =
    input.productLinks.length > 0
      ? sanitizeLinks(input.productLinks)
      : shopItemsToLegacyLinks(shopItems)

  const payload = {
    title: input.title,
    description: input.description,
    heroImage: input.heroImage,
    gallery: input.galleryImages ?? [],
    category: sanitizeCategory(input.category),
    productLinks,
    shopItems,
    featured: input.featured ?? false,
    slug: input.slug || slugify(input.title),
    sortWeight: input.sortWeight ?? 0,
    published: input.published ?? true,
    createdAt: now,
    updatedAt: now,
    viewCount: 0,
    clickCount: 0,
  }

  const res = await addDoc(collection(db, COLLECTION), payload)
  return res.id
}

export async function getAllOutfits(): Promise<OutfitDocument[]> {
  const snap = await getDocs(collection(db, COLLECTION))
  return snap.docs.map((d) => mapDocToOutfit(d.id, d.data()))
}

export async function getPublishedOutfits(): Promise<OutfitDocument[]> {
  const snap = await getDocs(collection(db, COLLECTION))

  return snap.docs
    .map((d) => mapDocToOutfit(d.id, d.data()))
    .filter((item) => item.published !== false)
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })
}

export async function getOutfitById(id: string): Promise<OutfitDocument | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return mapDocToOutfit(snap.id, snap.data())
}

export async function getOutfitBySlug(slug: string): Promise<OutfitDocument | null> {
  const snap = await getDocs(collection(db, COLLECTION))

  for (const d of snap.docs) {
    const data: any = d.data()
    const docSlug = data.slug || slugify(data.title || d.id)

    if (docSlug === slug) {
      return mapDocToOutfit(d.id, data)
    }
  }

  return null
}

export async function updateOutfit(
  id: string,
  input: Partial<OutfitInput>
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: nowIso(),
  }

  if (input.title !== undefined) {
    payload.title = input.title
    payload.slug = slugify(input.title)
  }

  if (input.description !== undefined) payload.description = input.description
  if (input.heroImage !== undefined) payload.heroImage = input.heroImage
  if (input.galleryImages !== undefined) payload.gallery = input.galleryImages
  if (input.category !== undefined) payload.category = sanitizeCategory(input.category)

  if (input.shopItems !== undefined) {
    const shopItems = sanitizeShopItems(input.shopItems)
    payload.shopItems = shopItems

    if (input.productLinks === undefined) {
      payload.productLinks = shopItemsToLegacyLinks(shopItems)
    }
  }

  if (input.productLinks !== undefined) {
    payload.productLinks = sanitizeLinks(input.productLinks)
  }

  if (input.featured !== undefined) payload.featured = input.featured
  if (input.sortWeight !== undefined) payload.sortWeight = input.sortWeight
  if (input.published !== undefined) payload.published = input.published

  await updateDoc(doc(db, COLLECTION, id), payload)
}

export async function deleteOutfit(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function incrementOutfitView(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    viewCount: increment(1),
    lastViewedAt: nowIso(),
  })
}

export async function incrementOutfitClick(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    clickCount: increment(1),
    lastClickedAt: nowIso(),
  })
}