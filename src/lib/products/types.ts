export interface Product {
  id: string
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
}

export interface OutfitLook {
  id: string;
  title: string;
  description: string;

  // NEW — required for CMS
  heroImage: string;
  gallery?: string[]; // multi-image support
  slug?: string;

  occasion: string;
  season: string;
  styleType: string;

  products: Product[];
  totalPrice: number;
  featured: boolean;

  // NEW — CMS meta fields
  createdAt?: string;
  updatedAt?: string;
  sortWeight?: number;

  // NEW — analytics
  viewCount?: number;
  clickCount?: number;
  lastViewedAt?: string;
  lastClickedAt?: string;
}


export interface ProductCategory {
  id: string
  name: string
  description?: string
  slug: string
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'finds-of-the-week', name: 'Finds of the Week', slug: 'finds-of-the-week' },
  { id: 'deals-of-the-week', name: 'Deals of the Week', slug: 'deals-of-the-week' },
  { id: 'fashion-on-a-budget', name: 'Fashion on a Budget', slug: 'fashion-on-a-budget' },
  { id: 'high-roller-list', name: 'High Roller List', slug: 'high-roller-list' },
  { id: 'best-accessories', name: 'Best Accessories', slug: 'best-accessories' },
  { id: 'emerging-brand-spotlight', name: 'Emerging Brand Spotlight', slug: 'emerging-brand-spotlight' },
]

export const OUTFIT_OCCASIONS = [
  'Work',
  'Casual',
  'Date Night',
  'Travel',
  'Weekend',
  'Formal Event',
  'Cocktail Hour',
  'Seasonal'
]

export const STYLE_TYPES = [
  'Minimalist',
  'Classic',
  'Modern',
  'Streetwear',
  'Business Casual',
  'Smart Casual',
  'Formal',
  'Casual'
]