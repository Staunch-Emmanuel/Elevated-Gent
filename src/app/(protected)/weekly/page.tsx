'use client'

import { useEffect, useMemo, useState } from 'react'

import { PagePadding, Container } from '@/components/layout'
import { Label } from '@/components/ui'
import { ProductCard } from '@/components/products/ProductCard'
import { StructuredData } from '@/components/seo/StructuredData'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

import { type Product } from '@/lib/products/types'
import { getWeeklyProducts } from '@/lib/firebase/weekly'

type CategoryOption = {
  id: string
  label: string
}

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

function productMatchesSearch(product: Product, query: string): boolean {
  if (!query) return true

  const searchableText = [
    product.title,
    product.brand,
    product.description,
    product.category,
    product.price,
    product.originalPrice,
    ...(Array.isArray(product.tags) ? product.tags : []),
    ...(Array.isArray(product.colors) ? product.colors : []),
    ...(Array.isArray(product.sizes) ? product.sizes : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return searchableText.includes(query)
}

export default function WeeklyPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
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

    void loadWeekly()
  }, [])

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const hasSearchQuery = normalizedSearchQuery.length > 0

  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const dynamicCategories = Array.from(
      new Map(
        cmsProducts
          .map((product) => {
            const label = String(product.category || '').trim()
            const id = categoryToSlug(label)

            if (!label || !id) return null

            return [id, { id, label }] as const
          })
          .filter(Boolean) as Array<readonly [string, CategoryOption]>
      ).values()
    )

    return [{ id: 'all', label: 'All Categories' }, ...dynamicCategories]
  }, [cmsProducts])

  const filteredProducts = useMemo(() => {
    return cmsProducts.filter((product) => {
      const matchesCategory =
        activeCategory === 'all' ||
        categoryToSlug(product.category) === activeCategory

      if (!matchesCategory) return false

      return productMatchesSearch(product, normalizedSearchQuery)
    })
  }, [activeCategory, cmsProducts, normalizedSearchQuery])

  const featuredProducts = useMemo(() => {
    return cmsProducts.filter((product) => Boolean(product.featured))
  }, [cmsProducts])

  useEffect(() => {
    if (activeCategory === 'all') return

    const stillExists = categoryOptions.some(
      (category) => category.id === activeCategory
    )

    if (!stillExists) {
      setActiveCategory('all')
    }
  }, [activeCategory, categoryOptions])

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

              <div className="max-w-2xl mx-auto px-4">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, brands or keywords..."
                    className="w-full rounded-full border border-gray-300 bg-white py-4 pl-12 pr-12 text-sm outline-none transition focus:border-black"
                  />

                  <svg
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>

                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-black"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>

                <p className="mt-3 text-center text-sm text-gray-500">
                  {loadingCmsProducts
                    ? 'Loading products...'
                    : `${filteredProducts.length} ${
                        filteredProducts.length === 1 ? 'product' : 'products'
                      } found`}
                </p>
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>

      {!hasSearchQuery ? (
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
                <p className="text-center text-gray-600">
                  No featured weekly products yet.
                </p>
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
      ) : null}

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
              <div className="py-16 text-center">
                <p className="text-xl font-semibold text-gray-800">
                  No products found
                </p>

                {hasSearchQuery ? (
                  <p className="mt-2 text-gray-500">
                    No results found for{' '}
                    <span className="font-medium">"{searchQuery}"</span>.
                  </p>
                ) : (
                  <p className="mt-2 text-gray-500">
                    No weekly products found.
                  </p>
                )}
              </div>
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