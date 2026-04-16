export type ArticleCategory =
  | 'general'
  | 'wellness'
  | 'style'
  | 'grooming'
  | 'lifestyle'
  | string

export type ArticleOccasion =
  | 'daily'
  | 'weekly'
  | 'event'
  | 'special'
  | string

export type ArticleStatus = 'draft' | 'published'

export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  heroImage?: string
  category: ArticleCategory
  tag?: string
  datePublished?: string
  publishDate?: string
  createdAt?: string
  updatedAt?: string
  occasion?: ArticleOccasion
  status?: ArticleStatus
  published?: boolean
}

export interface ArticleDocument {
  id: string
  slug?: string
  title?: string
  excerpt?: string
  content?: string
  heroImage?: string
  category?: ArticleCategory
  tag?: string
  datePublished?: string
  publishDate?: string
  createdAt?: string
  updatedAt?: string
  occasion?: ArticleOccasion
  status?: ArticleStatus
  published?: boolean

  source?: 'static' | 'cms'
  normalizedDate?: number
}

export interface AffiliateProduct {
  id: string
  name: string
  brand: string
  price: string
  priceValue?: number
  image: string
  description: string
  affiliateLink: string
  retailer?: string
  tier?: 'budget' | 'mid' | 'premium' | 'signature' | string
}