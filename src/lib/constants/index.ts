// App Configuration
export const APP_CONFIG = {
  name: 'The Elevated Gentleman - Classic Styling For The Modern Man',
  description: 'Classic styling for the modern man',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supportEmail: 'Markkoob@outlook.com',
} as const

// Navigation Links
export const NAVIGATION_LINKS = [
  { name: 'Personal Styling', href: '/personal-styling' },
  { name: 'Outfit Inspiration', href: '/outfit-inspiration' },
  { name: 'Weekly Finds', href: '/weekly' },
  { name: 'Articles', href: '/articles' },
  { name: 'Account', href: '/account' },
] as const

// Service Categories
export const SERVICE_CATEGORIES = [
  'styling',
  'consultation',
  'wardrobe',
] as const

// Product Categories
export const PRODUCT_CATEGORIES = [
  'clothing',
  'accessories',
  'shoes',
  'grooming',
  'lifestyle',
] as const

// Currency Configuration
export const CURRENCY = {
  code: 'USD',
  symbol: '$',
  locale: 'en-US',
} as const

// Pagination
export const PAGINATION = {
  defaultLimit: 12,
  maxLimit: 50,
} as const

// Social Links (matching Webflow site)
export const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/theelevatedgentlemen',
    icon: 'Instagram',
  },
] as const

// API Routes
export const API_ROUTES = {
  products: '/api/products',
  services: '/api/services',
  orders: '/api/orders',
  auth: '/api/auth',
  stripe: '/api/stripe',
} as const

// Wellness Article Categories
export const WELLNESS_CATEGORIES = [
  { id: 'all', name: 'All Articles', slug: 'all' },
  { id: 'blueprint', name: 'The Grooming Blueprint', slug: 'blueprint' },
  { id: 'confidence', name: 'Confidence & Wellness', slug: 'confidence' },
  { id: 'occasion', name: 'By Occasion', slug: 'occasion' },
  { id: 'products', name: 'Product Reviews', slug: 'products' },
  { id: 'lifestyle', name: 'Lifestyle', slug: 'lifestyle' },
] as const

// Article Occasions (maps to outfit categories)
export const ARTICLE_OCCASIONS = [
  { id: 'streetwear', name: 'Streetwear', slug: 'streetwear' },
  { id: 'casual', name: 'Casual', slug: 'casual' },
  { id: 'evening', name: 'Evening', slug: 'evening' },
  { id: 'business', name: 'Business Casual', slug: 'business' },
  { id: 'vacation', name: 'Vacation', slug: 'vacation' },
] as const


export const ARTICLE_NAV_CATEGORIES = [
  { name: 'Wellness', href: '/articles/category/wellness' },
  { name: 'Grooming Blueprint', href: '/articles/category/blueprint' },
  { name: 'Confidence', href: '/articles/category/confidence' },
  { name: 'By Occasion', href: '/articles/category/occasion' },
  { name: 'Product Reviews', href: '/articles/category/products' },
  { name: 'Lifestyle', href: '/articles/category/lifestyle' },
] as const