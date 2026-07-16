import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'

import { db } from '@/lib/firebase/config'
import type { ShoppableLink } from '@/lib/products/types'
import type { OutfitShopItem } from '@/lib/firebase/outfits'

export interface OutfitInspirationDocument {
  id: string
  title: string
  description: string
  imageUrl: string
  links: Array<string | ShoppableLink>
  shopItems: OutfitShopItem[]
  category?: string
  featured?: boolean
  slug?: string
  published?: boolean
  createdAt?: any
  updatedAt?: any
}

const COLLECTION = 'outfits'

function toDateValue(value: any): number {
  if (!value) return 0

  if (typeof value === 'string') {
    const time = new Date(value).getTime()
    return Number.isNaN(time) ? 0 : time
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate().getTime()
  }

  return 0
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
          label: rawLabel,
          url,
        }
      }

      return null
    })
    .filter((item): item is string | ShoppableLink => Boolean(item))
}

function sanitizeShopItems(value: unknown): OutfitShopItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null

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

      if (!name && !url && !imageUrl) return null

      return {
        id,
        name,
        brand,
        url,
        imageUrl,
        category,
        price,
        sortOrder,
      }
    })
    .filter((item): item is OutfitShopItem => Boolean(item))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

function normalizeCategory(data: any): string {
  const category = typeof data.category === 'string' ? data.category.trim() : ''
  const occasion = typeof data.occasion === 'string' ? data.occasion.trim() : ''
  const styleType = typeof data.styleType === 'string' ? data.styleType.trim() : ''
  const title = typeof data.title === 'string' ? data.title.trim() : ''

  if (category) return category

  const occasionLower = occasion.toLowerCase()
  const styleLower = styleType.toLowerCase()
  const titleLower = title.toLowerCase()

  if (
    occasionLower.includes('work') ||
    styleLower.includes('formal') ||
    styleLower.includes('business')
  ) {
    return 'Formal Wear'
  }

  if (
    occasionLower.includes('casual') ||
    titleLower.includes('casual')
  ) {
    return 'Casual Style'
  }

  if (
    styleLower.includes('streetwear') ||
    styleLower.includes('modern') ||
    titleLower.includes('streetwear')
  ) {
    return 'Streetwear'
  }

  if (
    occasionLower.includes('date') ||
    occasionLower.includes('cocktail') ||
    titleLower.includes('date')
  ) {
    return 'Date Night'
  }

  if (
    occasionLower.includes('wedding') ||
    occasionLower.includes('event')
  ) {
    return 'Weddings/Events'
  }

  if (
    occasionLower.includes('weekend') ||
    titleLower.includes('weekend')
  ) {
    return 'Weekend'
  }

  return ''
}

export async function getAllOutfitInspiration(): Promise<OutfitInspirationDocument[]> {
  let snap

  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    snap = await getDocs(q)
  } catch {
    snap = await getDocs(collection(db, COLLECTION))
  }

  return snap.docs
    .map((doc) => {
      const data = doc.data()

      return {
        id: doc.id,
        title: data.title ?? '',
        description: data.description ?? '',
        imageUrl: data.heroImage ?? data.imageUrl ?? '',
        links: sanitizeLinks(
          Array.isArray(data.productLinks)
            ? data.productLinks
            : Array.isArray(data.links)
              ? data.links
              : []
        ),
        shopItems: sanitizeShopItems(data.shopItems),
        category: normalizeCategory(data),
        featured: Boolean(data.featured),
        slug: data.slug ?? doc.id,
        published: typeof data.published === 'boolean' ? data.published : true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }
    })
    .filter((item) => item.published !== false)
    .sort((a, b) => toDateValue(b.createdAt) - toDateValue(a.createdAt))
}