'use client'

import { useEffect, useMemo, useState } from 'react'
import { PagePadding, Container } from '@/components/layout'
import { Button, Label } from '@/components/ui'

import {
  PRODUCT_CATEGORIES,
  type Product,
  type OutfitLook,
} from '@/lib/products/types'

import { ProductCard } from '@/components/products/ProductCard'
import { OutfitCard } from '@/components/products/OutfitCard'

import { StructuredData } from '@/components/seo/StructuredData'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

import { getWeeklyProducts } from '@/lib/firebase/weekly'
import { getPublishedOutfits, type OutfitDocument } from '@/lib/firebase/outfits'

const categoryOptions = [
  { id: 'all', label: 'All Categories' },
  ...PRODUCT_CATEGORIES.map((cat) => ({ id: cat.slug, label: cat.name })),
]

function normalizeProduct(input: Partial<Product> & { id?: string }): Product {
  return {
    id: input.id ?? '',
    slug: input.slug ?? '',
    title: input.title ?? '',
    brand: input.brand ?? '',
    description: input.description ?? '',
    image: input.image ?? '',
    price: input.price ?? '',
    originalPrice: input.originalPrice ?? '',
    category: input.category ?? '',
    tags: Array.isArray(input.tags) ? input.tags : [],
    productLink: input.productLink ?? '',
    affiliateLink: input.affiliateLink ?? '',
    featured: Boolean(input.featured),
    inStock: typeof input.inStock === 'boolean' ? input.inStock : true,
    sizes: Array.isArray(input.sizes) ? input.sizes : [],
    colors: Array.isArray(input.colors) ? input.colors : [],
  }
}

function categoryToSlug(category: string): string {
  return (category || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
}

function buildProductMap(products: Product[]): Map<string, Product> {
  const map = new Map<string, Product>()
  for (const p of products) {
    if (!p?.id) continue
    map.set(p.id, p)
  }
  return map
}

function hydrateCmsOutfits(cmsOutfits: OutfitDocument[], productMap: Map<string, Product>): OutfitLook[] {
  return cmsOutfits.map((o) => {
    const hydratedProducts = (o.products || [])
      .map((id) => productMap.get(id))
      .filter(Boolean) as Product[]

    return {
      id: o.id,
      slug: o.slug ?? '',
      title: o.title ?? '',
      description: o.description ?? '',
      heroImage: o.heroImage ?? '',
      occasion: o.occasion ?? '',
      season: o.season ?? '',
      styleType: o.styleType ?? '',
      products: hydratedProducts,
      totalPrice: typeof o.totalPrice === 'number' ? o.totalPrice : 0,
      featured: Boolean(o.featured),
    }
  })
}

export default function WeeklyPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [showOutfits, setShowOutfits] = useState(false)

  const [cmsProducts, setCmsProducts] = useState<Product[]>([])
  const [loadingCmsProducts, setLoadingCmsProducts] = useState(true)

  const [cmsOutfits, setCmsOutfits] = useState<OutfitDocument[]>([])
  const [loadingCmsOutfits, setLoadingCmsOutfits] = useState(true)

  useEffect(() => {
    async function loadWeekly() {
      try {
        const items = await getWeeklyProducts()
        setCmsProducts(items.map((p) => normalizeProduct(p)))
      } catch (err) {
        console.error('Error loading CMS weekly products:', err)
        setCmsProducts([])
      } finally {
        setLoadingCmsProducts(false)
      }
    }

    async function loadOutfits() {
      try {
        const items = await getPublishedOutfits()
        setCmsOutfits(items)
      } catch (err) {
        console.error('Error loading CMS outfits:', err)
        setCmsOutfits([])
      } finally {
        setLoadingCmsOutfits(false)
      }
    }

    loadWeekly()
    loadOutfits()
  }, [])

  const productMap = useMemo(() => {
    return buildProductMap(cmsProducts)
  }, [cmsProducts])

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return cmsProducts
    return cmsProducts.filter((product) => categoryToSlug(product.category) === activeCategory)
  }, [activeCategory, cmsProducts])

  const featuredProducts = useMemo(() => {
    return cmsProducts.filter((product) => Boolean(product.featured))
  }, [cmsProducts])

  const mergedOutfits: OutfitLook[] = useMemo(() => {
    return hydrateCmsOutfits(cmsOutfits, productMap)
  }, [cmsOutfits, productMap])

  const featuredOutfits = useMemo(() => {
    return mergedOutfits.filter((o) => Boolean(o.featured))
  }, [mergedOutfits])

  return (
    <ProtectedRoute>
      <StructuredData pageKey="weekly" />

      <section className="py-16">
        <PagePadding>
          <Container>
            <div className="text-center space-y-8">
              <div className="overflow-hidden px-4">
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-semibold font-sans leading-tight">
                  WEEKLY FINDS
                </h1>
              </div>

              <p className="text-lg md:text-xl font-serif text-muted max-w-3xl mx-auto leading-relaxed px-4">
                Curated weekly selections featuring the best finds, deals, budget-friendly options,
                luxury pieces, accessories, and emerging brands in men&apos;s fashion.
              </p>

              <div className="flex justify-center gap-4 pt-4">
                <Button
                  variant={!showOutfits ? 'default' : 'outline'}
                  onClick={() => setShowOutfits(false)}
                >
                  Weekly Products
                </Button>

                <Button
                  variant={showOutfits ? 'default' : 'outline'}
                  onClick={() => setShowOutfits(true)}
                >
                  Shop This Look
                </Button>
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>

      <section className="py-16 bg-gray-50">
        <PagePadding>
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold font-sans mb-4">
                {showOutfits ? 'Featured Outfit Looks' : 'Featured This Week'}
              </h2>

              <p className="text-gray-600 font-serif">
                {showOutfits
                  ? 'Complete outfit inspiration with shoppable looks'
                  : 'Our top picks from across all categories'}
              </p>
            </div>

            {!showOutfits ? (
              loadingCmsProducts ? (
                <p className="text-center">Loading products...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {featuredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 p-6"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )
            ) : loadingCmsOutfits ? (
              <p className="text-center">Loading outfits...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredOutfits.map((outfit) => (
                  <OutfitCard key={outfit.id} outfit={outfit} />
                ))}
              </div>
            )}
          </Container>
        </PagePadding>
      </section>

      {!showOutfits ? (
        <section className="py-16">
          <PagePadding>
            <Container>
              <div className="flex justify-center mb-12">
                <div className="flex gap-2 flex-wrap justify-center">
                  {categoryOptions.map((category) => (
                    <Label
                      key={category.id}
                      variant={activeCategory === category.id ? 'inverse' : 'default'}
                      onClick={() => setActiveCategory(category.id)}
                      className="cursor-pointer"
                    >
                      {category.label}
                    </Label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Container>
          </PagePadding>
        </section>
      ) : (
        <section className="py-16">
          <PagePadding>
            <Container>
              <div className="text-center mb-12">
                <h3 className="text-xl font-semibold font-sans mb-4">
                  Complete Outfit Inspiration
                </h3>

                <p className="text-gray-600 font-serif max-w-2xl mx-auto">
                  Browse curated outfit combinations with direct links to shop each piece.
                  Perfect for effortless styling and wardrobe building.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mergedOutfits.map((outfit) => (
                  <OutfitCard key={outfit.id} outfit={outfit} />
                ))}
              </div>
            </Container>
          </PagePadding>
        </section>
      )}
    </ProtectedRoute>
  )
}