export interface Product {
  id: string
  slug: string
  title: string
  brand: string
  description: string
  image: string
  price: string
  originalPrice?: string
  category: string
  tags: string[]
  productLink: string
  affiliateLink?: string
  featured: boolean
  inStock?: boolean
  sizes?: string[]
  colors?: string[]
  published?: boolean
}

export type ShoppableLink = {
  label: string
  url: string
}

export interface OutfitLook {
  id: string
  title: string
  description: string
  heroImage: string
  gallery?: string[]
  slug: string
  occasion: string
  season: string
  styleType: string
  productLinks: Array<string | ShoppableLink>
  featured: boolean
  published?: boolean
  createdAt?: string
  updatedAt?: string
  sortWeight?: number
  viewCount?: number
  clickCount?: number
  lastViewedAt?: string
  lastClickedAt?: string
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
  slug: string
  section?: 'weekly' | 'outfits' | 'articles'
  createdAt?: string
  updatedAt?: string
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
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
]

export const OUTFIT_OCCASIONS = [
  'Work',
  'Casual',
  'Date Night',
  'Travel',
  'Weekend',
  'Formal Event',
  'Cocktail Hour',
  'Seasonal',
]

export const STYLE_TYPES = [
  'Minimalist',
  'Classic',
  'Modern',
  'Streetwear',
  'Business Casual',
  'Smart Casual',
  'Formal',
  'Casual',
]