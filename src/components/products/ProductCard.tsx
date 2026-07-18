'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button, Label } from '@/components/ui'
import { Product } from '@/lib/products/types'
import { getShoppableLink, trackAffiliateClick } from '@/lib/products/utils'
import { useAuth } from '@/lib/firebase/auth'
import { toggleFavorite } from '@/lib/firebase/favorites'

interface ProductCardProps {
  product: Product
  showFullDetails?: boolean
  className?: string
}

export function ProductCard({
  product,
  showFullDetails = true,
  className = '',
}: ProductCardProps) {
  const { user } = useAuth()
  const [showDetails, setShowDetails] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const handleToggleDetails = () => {
    if (!showFullDetails) {
      handleBuyProduct()
      return
    }

    setShowDetails((value) => !value)
  }

  const handleBuyProduct = () => {
    const url = getShoppableLink(product)
    trackAffiliateClick(product.id, product.affiliateLink)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleToggleFavorite = async () => {
    if (!user?.uid) {
      alert('Please sign in to save favorites.')
      return
    }

    setFavoriteLoading(true)

    try {
      const nextValue = await toggleFavorite({
        userId: user.uid,
        contentId: product.id,
        type: 'weekly',
        title: product.title,
        imageUrl: product.image,
        category: product.category,
        brand: product.brand,
        price: product.price,
        description: product.description,
        externalUrl: getShoppableLink(product),
        isFavorited,
      })

      setIsFavorited(nextValue)
    } catch (error) {
      console.error('Favorite product error:', error)
      alert('Unable to update saved item. Please try again.')
    } finally {
      setFavoriteLoading(false)
    }
  }

  return (
    <div
      className={`flex h-full flex-col border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-3 text-[var(--color-eg-ink)] shadow-[0_16px_42px_rgba(24,23,17,0.10)] transition-transform duration-300 hover:-translate-y-1 sm:p-4 ${className}`}
    >
      <div className="flex h-full flex-col space-y-5">
        <div className="relative aspect-square overflow-hidden bg-[var(--color-eg-paper-soft)]">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,23,17,0.02)_0%,rgba(24,23,17,0.12)_100%)]" />

          <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
            <Label className="border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] text-[var(--color-eg-espresso-deep)]">
              {product.category}
            </Label>
          </div>

          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            className="absolute bottom-3 right-3 z-10 rounded-full border border-[rgba(248,241,229,0.68)] bg-[rgba(248,241,229,0.94)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-eg-espresso-deep)] shadow-[0_6px_18px_rgba(24,23,17,0.16)] transition-colors hover:border-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)] disabled:opacity-60 sm:bottom-4 sm:right-4"
          >
            {isFavorited ? 'Saved' : 'Save'}
          </button>

          {product.originalPrice ? (
            <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
              <Label
                variant="inverse"
                className="border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-xs text-[var(--color-eg-cream)]"
              >
                SALE
              </Label>
            </div>
          ) : null}

          {!product.inStock ? (
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
              <div className="bg-[#913a32] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white">
                OUT OF STOCK
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col space-y-4 px-1 pb-1">
          <div className="flex items-start justify-between gap-4">
            <span className="pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-muted)]">
              {product.brand}
            </span>

            <div className="flex shrink-0 items-center gap-2">
              <span className="text-lg font-semibold text-[var(--color-eg-espresso-deep)]">
                {product.price}
              </span>

              {product.originalPrice ? (
                <span className="text-sm text-[var(--color-eg-muted)] line-through">
                  {product.originalPrice}
                </span>
              ) : null}
            </div>
          </div>

          <h3 className="font-editorial text-2xl font-normal leading-tight tracking-[-0.03em] text-[var(--color-eg-ink)]">
            {product.title}
          </h3>

          {showFullDetails && product.description ? (
            <p
              className={`whitespace-pre-line font-serif text-sm leading-7 text-[var(--color-eg-muted)] ${
                showDetails ? '' : 'line-clamp-2'
              }`}
            >
              {product.description}
            </p>
          ) : null}

          <div className="mt-auto border-t border-[var(--color-eg-line)] pt-4">
            <Button
              size="sm"
              onClick={handleToggleDetails}
              disabled={!product.inStock}
              className="w-full border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]"
            >
              {showDetails ? 'Hide Details' : 'View Product'}
            </Button>
          </div>

          {showFullDetails && showDetails ? (
            <div className="mt-1 space-y-5 border-t border-[var(--color-eg-line)] pt-5">
              <h4 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-eg-espresso-deep)]">
                Product Details
              </h4>

              {Array.isArray(product.tags) && product.tags.length > 0 ? (
                <div>
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-muted)]">
                    Features
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-3 py-1.5 font-serif text-xs text-[var(--color-eg-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
                <div>
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-muted)]">
                    Available Sizes
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <span
                        key={size}
                        className="border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-3 py-1.5 text-xs text-[var(--color-eg-muted)]"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {Array.isArray(product.colors) && product.colors.length > 0 ? (
                <div>
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-muted)]">
                    Available Colors
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        className="border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-3 py-1.5 text-xs text-[var(--color-eg-muted)]"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="border-t border-[var(--color-eg-line)] pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-serif text-sm text-[var(--color-eg-muted)]">
                    Category: {product.category}
                  </span>

                  <Button
                    size="sm"
                    onClick={handleBuyProduct}
                    disabled={!product.inStock}
                    className="border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ProductCard