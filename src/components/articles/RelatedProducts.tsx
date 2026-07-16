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
    <section className="-mx-6 bg-[var(--color-eg-paper)] px-6 py-12 text-[var(--color-eg-ink)] md:-mx-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-eg-muted)]">
            Curated Selection
          </p>

          <h2 className="mb-3 font-editorial text-4xl font-normal text-[var(--color-eg-ink)] md:text-5xl">
            Recommended Products
          </h2>

          <p className="font-serif text-[var(--color-eg-muted)]">
            Shop our curated picks at three price points
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {productArray.map((product) => (
            <div
              key={product.id}
              className="flex h-full flex-col space-y-4 border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-4 shadow-[0_12px_32px_rgba(24,23,17,0.07)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-[var(--color-eg-espresso-deep)] px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-cream)]">
                  {product.tier}
                </span>

                <span className="font-sans font-semibold text-[var(--color-eg-espresso-deep)]">
                  {product.price}
                </span>
              </div>

              <div className="relative aspect-square overflow-hidden bg-[var(--color-eg-paper-soft)]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                />
              </div>

              <div className="flex flex-1 flex-col space-y-3">
                <div>
                  <p className="mb-1 font-serif text-[11px] uppercase tracking-[0.14em] text-[var(--color-eg-muted)]">
                    {product.brand}
                  </p>

                  <h3 className="font-sans text-sm font-semibold leading-snug text-[var(--color-eg-ink)]">
                    {product.name}
                  </h3>
                </div>

                <p className="line-clamp-2 flex-1 font-serif text-xs leading-6 text-[var(--color-eg-muted)]">
                  {product.description}
                </p>
              </div>

              <Button
                size="sm"
                className="w-full border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]"
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