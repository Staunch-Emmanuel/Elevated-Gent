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

      <section className="border-b border-[rgba(232,235,236,0.22)] bg-[var(--color-eg-espresso)] py-16 text-[var(--color-eg-cream)] md:py-20">
        <PagePadding>
          <Container>
            <div className="space-y-8 text-center">
              <div className="overflow-hidden px-4">
                <h1 className="eg-editorial-heading text-5xl text-[var(--color-eg-cream)] md:text-7xl lg:text-8xl">
                  WEEKLY FINDS
                </h1>
              </div>

              <p className="mx-auto max-w-3xl px-4 font-serif text-lg leading-relaxed text-[rgba(232,235,236,0.92)] md:text-xl">
                Curated weekly selections featuring the best finds, deals,
                budget-friendly options, luxury pieces, accessories, and
                emerging brands in men&apos;s fashion.
              </p>

              <div className="mx-auto max-w-3xl px-4">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, brands or keywords..."
                    className="w-full rounded-full border border-[rgba(41,40,32,0.18)] bg-[var(--color-eg-cream)] py-4 pl-12 pr-12 text-sm text-[var(--color-eg-ink)] shadow-[0_8px_24px_rgba(41,40,32,0.12)] outline-none transition placeholder:text-[rgba(41,40,32,0.48)] focus:border-[var(--color-eg-espresso-deep)]"
                  />

                  <svg
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgba(41,40,32,0.56)]"
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(41,40,32,0.56)] transition hover:text-[var(--color-eg-ink)]"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>

                <p className="mt-4 text-center text-sm font-medium text-[rgba(232,235,236,0.86)]">
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
        <section className="border-b border-[rgba(41,40,32,0.12)] bg-[var(--color-eg-paper)] py-16 md:py-20">
          <PagePadding>
            <Container>
              <div className="mb-12 text-center">
                <h2 className="eg-editorial-heading mb-4 text-4xl text-[var(--color-eg-ink)] md:text-5xl">
                  Featured This Week
                </h2>

                <p className="font-serif text-[rgba(41,40,32,0.74)]">
                  Our top picks from across all categories
                </p>
              </div>

              {loadingCmsProducts ? (
                <p className="text-center font-serif text-[rgba(41,40,32,0.72)]">
                  Loading products...
                </p>
              ) : featuredProducts.length === 0 ? (
                <p className="text-center font-serif text-[rgba(41,40,32,0.72)]">
                  No featured weekly products yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-3">
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="self-start">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </Container>
          </PagePadding>
        </section>
      ) : null}

      <section className="bg-[var(--color-eg-espresso-soft)] py-16 md:py-20">
        <PagePadding>
          <Container>
            <div className="mb-12 flex justify-center">
              <div className="flex flex-wrap justify-center gap-2">
                {categoryOptions.map((category) => {
                  const active = activeCategory === category.id

                  return (
                    <Label
                      key={category.id}
                      variant={active ? 'inverse' : 'default'}
                      onClick={() => setActiveCategory(category.id)}
                      className={
                        active
                          ? 'cursor-pointer border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] text-[var(--color-eg-espresso-deep)]'
                          : 'cursor-pointer border-[rgba(232,235,236,0.56)] bg-transparent text-[var(--color-eg-cream)] transition hover:border-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]'
                      }
                    >
                      {category.label}
                    </Label>
                  )
                })}
              </div>
            </div>

            {loadingCmsProducts ? (
              <p className="text-center font-serif text-[rgba(232,235,236,0.86)]">
                Loading products...
              </p>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-xl font-semibold text-[var(--color-eg-cream)]">
                  No products found
                </p>

                {hasSearchQuery ? (
                  <p className="mt-2 text-[rgba(232,235,236,0.84)]">
                    No results found for{' '}
                    <span className="font-medium text-[var(--color-eg-cream)]">
                      &quot;{searchQuery}&quot;
                    </span>
                    .
                  </p>
                ) : (
                  <p className="mt-2 text-[rgba(232,235,236,0.84)]">
                    No weekly products found.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
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