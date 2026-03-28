import { adminDb } from './init'

export interface OutfitInspirationDocument {
  id: string
  slug?: string
  title: string
  imageUrl: string
  links: string[]
  occasion?: string
  featured?: boolean
  published?: boolean
  createdAt?: string
  updatedAt?: string
}

function sanitizeLinks(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

export async function getAllOutfitInspirationPublic(): Promise<OutfitInspirationDocument[]> {
  const snap = await adminDb.collection('outfitInspiration').get()

  return snap.docs
    .map((doc) => {
      const data = doc.data()

      return {
        id: doc.id,
        slug: data.slug ?? doc.id,
        title: data.title ?? '',
        imageUrl: data.imageUrl ?? '',
        links: sanitizeLinks(data.links),
        occasion: data.occasion ?? '',
        featured: Boolean(data.featured),
        published: typeof data.published === 'boolean' ? data.published : true,
        createdAt: data.createdAt ?? '',
        updatedAt: data.updatedAt ?? '',
      }
    })
    .filter((item) => item.published !== false)
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })
}