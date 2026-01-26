'use client'

import Image from 'next/image'
import { Button } from '@/components/ui'

type AffiliateProduct = {
  id: string
  tier: string
  price: string
  priceValue: number
  image: string
  name: string
  brand: string
  description: string
  retailer: string
  affiliateLink: string
}

interface RelatedProductsProps {
  products: {
    budget?: AffiliateProduct
    signature?: AffiliateProduct
    upgrade?: AffiliateProduct
  }
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const productArray = [products.budget, products.signature, products.upgrade].filter(
    Boolean
  ) as AffiliateProduct[]

  if (productArray.length === 0) return null

  return (
    <section className="py-12 bg-gray-50 -mx-6 px-6 md:-mx-12 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold font-sans mb-2">
            Recommended Products
          </h2>
          <p className="text-gray-600 font-serif">
            Shop our curated picks at three price points
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productArray.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 p-4 space-y-4"
            >
              {/* Tier Badge */}
              <div className="flex justify-between items-start">
                <span className="text-xs px-2 py-1 bg-black text-white rounded-full font-sans uppercase tracking-wide">
                  {product.tier}
                </span>
                <span className="font-sans font-semibold">{product.price}</span>
              </div>

              {/* Product Image */}
              <div className="aspect-square relative bg-gray-50 rounded overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-serif text-gray-500 uppercase tracking-wide">
                    {product.brand}
                  </p>
                  <h3 className="font-sans font-semibold text-sm">
                    {product.name}
                  </h3>
                </div>
                <p className="text-xs font-serif text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              </div>

              {/* CTA */}
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  // Track affiliate click (analytics)
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    ;(window as any).gtag('event', 'affiliate_click', {
                      product_id: product.id,
                      product_name: product.name,
                      retailer: product.retailer,
                      price: product.priceValue,
                    })
                  }
                  // Open affiliate link
                  window.open(product.affiliateLink, '_blank')
                }}
              >
                Shop at {product.retailer}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
