'use client'

import { useEffect, useMemo, useState } from 'react'

import { PagePadding, Container } from '@/components/layout'
import { Label } from '@/components/ui'
import { ProductCard } from '@/components/products/ProductCard'
import { StructuredData } from '@/components/seo/StructuredData'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

import {
  PRODUCT_CATEGORIES,
  type Product,
} from '@/lib/products/types'
import { getWeeklyProducts } from '@/lib/firebase/weekly'

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
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function WeeklyPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [cmsProducts, setCmsProducts] = useState<Product[]>([])
  const [loadingCmsProducts, setLoadingCmsProducts] = useState(true)

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

    loadWeekly()
  }, [])

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return cmsProducts
    return cmsProducts.filter((product) => categoryToSlug(product.category) === activeCategory)
  }, [activeCategory, cmsProducts])

  const featuredProducts = useMemo(() => {
    return cmsProducts.filter((product) => Boolean(product.featured))
  }, [cmsProducts])

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
            </div>
          </Container>
        </PagePadding>
      </section>

      <section className="py-16 bg-gray-50">
        <PagePadding>
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold font-sans mb-4">
                Featured This Week
              </h2>

              <p className="text-gray-600 font-serif">
                Our top picks from across all categories
              </p>
            </div>

            {loadingCmsProducts ? (
              <p className="text-center">Loading products...</p>
            ) : featuredProducts.length === 0 ? (
              <p className="text-center text-gray-600">No featured weekly products yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 p-6 self-start"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </Container>
        </PagePadding>
      </section>

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

            {loadingCmsProducts ? (
              <p className="text-center">Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center text-gray-600">No weekly products found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="self-start">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </Container>
        </PagePadding>
      </section>
    </ProtectedRoute>
  )
}