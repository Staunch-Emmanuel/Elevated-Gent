'use client'

import { useEffect, useState } from 'react'
import { PagePadding, Container } from '@/components/layout'
import { Button, Label } from '@/components/ui'
import {
  weeklyProducts as staticWeeklyProducts,
  outfitLooks,
} from '@/lib/products/data'
import { PRODUCT_CATEGORIES, type Product } from '@/lib/products/types'
import { ProductCard } from '@/components/products/ProductCard'
import OutfitCard from '@/components/products/OutfitCard'
import { StructuredData } from '@/components/seo/StructuredData'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { getWeeklyProducts } from '@/lib/firebase/weekly'

const categoryOptions = [
  { id: 'all', label: 'All Categories' },
  ...PRODUCT_CATEGORIES.map((cat) => ({ id: cat.slug, label: cat.name })),
]

export default function WeeklyPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [showOutfits, setShowOutfits] = useState(false)
  const [cmsProducts, setCmsProducts] = useState<Product[]>([])
  const [loadingCms, setLoadingCms] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const items = await getWeeklyProducts()
        setCmsProducts(items)
      } catch (err) {
        console.error('Error loading CMS weekly products:', err)
      } finally {
        setLoadingCms(false)
      }
    }

    load()
  }, [])

  const allProducts: Product[] = [...cmsProducts, ...staticWeeklyProducts]

  const filteredProducts =
    activeCategory === 'all'
      ? allProducts
      : allProducts.filter(
          (product) =>
            product.category.toLowerCase().replace(/\s+/g, '-') ===
            activeCategory
        )

  const featuredProducts = allProducts.filter((product) => product.featured)
  const featuredOutfits = outfitLooks.filter((outfit) => outfit.featured)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Weekly Finds',
    description:
      'Curated weekly fashion finds including products, deals, and outfit inspiration for men.',
    url: 'https://elevatedgent.com/weekly',
  }

  return (
    <ProtectedRoute>
      <StructuredData data={structuredData} />

      {/* Hero Section */}
      <section className="py-16">
        <PagePadding>
          <Container>
            <div className="text-center space-y-8">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-semibold">
                WEEKLY FINDS
              </h1>

              <p className="text-lg md:text-xl font-serif text-muted max-w-3xl mx-auto">
                Curated weekly selections featuring the best finds, deals,
                budget-friendly options, luxury pieces, accessories, and
                emerging brands in men&apos;s fashion.
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

      {/* Featured Section */}
      <section className="py-16 bg-gray-50">
        <PagePadding>
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                {showOutfits
                  ? 'Featured Outfit Looks'
                  : 'Featured This Week'}
              </h2>
              <p className="text-gray-600 font-serif">
                {showOutfits
                  ? 'Complete outfit inspiration with shoppable looks'
                  : 'Our top picks from across all categories'}
              </p>
            </div>

            {!showOutfits ? (
              loadingCms && staticWeeklyProducts.length === 0 ? (
                <p className="text-center">Loading products...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {featuredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg p-6 border"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )
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

      {/* Main Content */}
      {!showOutfits ? (
        <section className="py-16">
          <PagePadding>
            <Container>
              <div className="flex justify-center mb-12">
                <div className="flex gap-2 flex-wrap justify-center">
                  {categoryOptions.map((category) => (
                    <Label
                      key={category.id}
                      variant={
                        activeCategory === category.id
                          ? 'inverse'
                          : 'default'
                      }
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {outfitLooks.map((outfit) => (
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
