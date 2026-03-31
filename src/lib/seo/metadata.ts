import { Metadata } from 'next'

export interface SEOData {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  openGraph?: {
    title?: string
    description?: string
    image?: string
    type?: string
  }
  twitter?: {
    card?: string
    title?: string
    description?: string
    image?: string
  }
  structuredData?: object
}

const defaultSEO: SEOData = {
  title: 'The Elevated Gentleman - Classic Styling For The Modern Man',
  description: 'Professional styling services, curated collections, and weekly fashion finds for the discerning gentleman. Elevate your style with personalized consultations and premium affiliate products.',
  keywords: [
    'men\'s fashion',
    'styling services',
    'personal stylist',
    'men\'s style consultation',
    'curated fashion',
    'elevated gentleman',
    'classic menswear',
    'modern style',
    'fashion consultant',
    'wardrobe styling'
  ],
  openGraph: {
    title: 'The Elevated Gentleman - Classic Styling For The Modern Man',
    description: 'Professional styling services and curated collections for the modern gentleman',
    image: '/images/og-image.jpg',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Elevated Gentleman',
    description: 'Professional styling services for the modern gentleman',
    image: '/images/twitter-image.jpg'
  }
}

export const seoPages = {
  home: {
    title: 'The Elevated Gentleman - Classic Styling For The Modern Man',
    description: 'Transform your style with our professional styling services. Get personalized consultations, curated collections, and expert fashion advice for the modern gentleman.',
    keywords: ['men\'s styling services', 'personal style consultant', 'wardrobe transformation', 'elevated gentleman'],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'The Elevated Gentleman',
      url: 'https://theelevatedgentleman.com',
      description: 'Professional styling services for the modern gentleman',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'Markkoob@outlook.com',
        contactType: 'customer service'
      },
      sameAs: [
        'https://instagram.com/theelevatedgentlemen'
      ]
    }
  },
  'personal-styling': {
    title: 'Personal Styling Services - The Elevated Gentleman',
    description: 'Book professional styling consultations starting at $250. Get personalized lookbooks, shopping guidance, and 1-month support from expert stylists.',
    keywords: ['personal styling', 'styling packages', 'personal styling consultation', 'lookbook creation', 'wardrobe consultation'],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Professional Styling Services',
      provider: {
        '@type': 'Organization',
        name: 'The Elevated Gentleman'
      },
      offers: [
        {
          '@type': 'Offer',
          name: 'The Foundation Package',
          price: '500',
          priceCurrency: 'USD',
          description: 'Seasonal lookbook and personal shopping guidance'
        },
        {
          '@type': 'Offer',
          name: 'The Signature Refresh',
          price: '750',
          priceCurrency: 'USD',
          description: 'Comprehensive style refresh with consultation'
        },
        {
          '@type': 'Offer',
          name: 'The Gentlemen\'s Upgrade',
          price: '1000',
          priceCurrency: 'USD',
          description: 'Most comprehensive package with full consultation'
        }
      ]
    }
  },
  'outfit-inspiration': {
    title: 'Outfit Inspiration - The Elevated Gentleman',
    description: 'Discover curated outfit inspiration from trusted partners. Browse streetwear, date night, casual, and formal looks for the discerning gentleman.',
    keywords: ['outfit inspiration', 'men\'s outfits', 'streetwear', 'date night outfits', 'smart casual', 'formal wear'],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Outfit Inspiration',
      description: 'Carefully curated outfit looks for the modern gentleman'
    }
  },
  weekly: {
    title: 'Weekly Fashion Finds & Shop This Look - The Elevated Gentleman',
    description: 'Discover this week\'s best men\'s fashion finds and complete outfit inspiration. Shop individual pieces or complete looks with our affiliate partners.',
    keywords: ['weekly fashion finds', 'shop this look', 'men\'s fashion deals', 'outfit inspiration', 'affiliate fashion'],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Weekly Fashion Finds',
      description: 'Curated weekly selection of men\'s fashion products'
    }
  },
  account: {
    title: 'My Account - The Elevated Gentleman',
    description: 'Manage your styling profile, view booking history, and update your style preferences.',
    keywords: ['account management', 'style profile', 'booking history']
  },
  auth: {
    signin: {
      title: 'Sign In - The Elevated Gentleman',
      description: 'Access your styling account to book services, view collections, and manage your style preferences.'
    },
    signup: {
      title: 'Create Account - The Elevated Gentleman',
      description: 'Join The Elevated Gentleman to access professional styling services and curated fashion collections.'
    },
    'forgot-password': {
      title: 'Reset Password - The Elevated Gentleman',
      description: 'Reset your password to regain access to your styling account.'
    }
  }
}

export function generateMetadata(pageKey: string, customData?: Partial<SEOData>): Metadata {
  const pageData = getPageSEO(pageKey)
  const seoData = { ...defaultSEO, ...pageData, ...customData }

  const metadata: Metadata = {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords?.join(', '),
    openGraph: {
      title: seoData.openGraph?.title || seoData.title,
      description: seoData.openGraph?.description || seoData.description,
      images: seoData.openGraph?.image ? [seoData.openGraph.image] : undefined,
      type: seoData.openGraph?.type as any || 'website',
      siteName: 'The Elevated Gentleman'
    },
    twitter: {
      card: seoData.twitter?.card as any || 'summary_large_image',
      title: seoData.twitter?.title || seoData.title,
      description: seoData.twitter?.description || seoData.description,
      images: seoData.twitter?.image ? [seoData.twitter.image] : undefined
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION_ID,
      yandex: process.env.YANDEX_VERIFICATION_ID,
      yahoo: process.env.YAHOO_VERIFICATION_ID,
    },
  }

  if (seoData.canonical) {
    metadata.alternates = {
      canonical: seoData.canonical
    }
  }

  return metadata
}

function getPageSEO(pageKey: string): Partial<SEOData> {
  // Handle nested keys like auth.signin
  const keys = pageKey.split('.')
  let data: any = seoPages

  for (const key of keys) {
    data = data?.[key]
    if (!data) break
  }

  return data || {}
}

export function generateStructuredData(pageKey: string): string | null {
  const pageData = getPageSEO(pageKey)

  if (pageData.structuredData) {
    return JSON.stringify(pageData.structuredData)
  }

  return null
}