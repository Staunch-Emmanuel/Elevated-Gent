export type ArticleStatus = 'draft' | 'published'

export interface ArticleDocument {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  heroImage: string
  source: 'static' | 'cms'
  createdAt: number
  updatedAt: number
  normalizedDate: number
  status?: ArticleStatus
  published?: boolean
}

export type ArticleCategory =
  | 'general'
  | 'grooming'
  | 'wellness'
  | 'style'
  | 'lifestyle'

export interface AffiliateProduct {
  id: string
  name: string
  brand: string
  price: string
  priceValue: number
  image: string
  description: string
  affiliateLink: string
  retailer: string
  tier: string
}

export type ArticleOccasion =
  | 'daily'
  | 'evening'
  | 'business'
  | 'formal'
  | 'casual'