import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore'

import { db } from '@/lib/firebase/config'

export interface OutfitInspirationDocument {
  id: string
  title: string
  description: string
  imageUrl: string
  links: string[]
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
        links: Array.isArray(data.productLinks)
          ? data.productLinks
          : Array.isArray(data.links)
            ? data.links
            : [],
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