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
      className={`h-full border border-[var(--color-eg-espresso)] bg-[var(--color-eg-paper-soft)] p-4 shadow-[8px_8px_0_rgba(43,22,4,0.10)] transition-transform duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="space-y-4">
        <div className="aspect-square bg-[var(--color-eg-paper)] border border-[var(--color-eg-espresso)] overflow-hidden relative">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute inset-0 bg-black/5" />

          <div className="absolute top-4 left-4">
            <Label>{product.category}</Label>
          </div>

          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            className="absolute bottom-4 right-4 z-10 rounded-full border border-[var(--color-eg-espresso)] bg-[var(--color-eg-paper-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-eg-espresso)] shadow-sm transition-colors hover:bg-[var(--color-eg-espresso)] hover:text-[var(--color-eg-cream)] disabled:opacity-60"
          >
            {isFavorited ? 'Saved' : 'Save'}
          </button>

          {product.originalPrice ? (
            <div className="absolute top-4 right-4">
              <Label variant="inverse" className="text-xs">
                SALE
              </Label>
            </div>
          ) : null}

          {!product.inStock ? (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-red-600 text-white text-xs px-2 py-1 text-center font-semibold uppercase tracking-wide">
                OUT OF STOCK
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-[var(--color-eg-muted)] uppercase tracking-[0.12em]">
              {product.brand}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-lg font-semibold text-[var(--color-eg-espresso)]">
                {product.price}
              </span>

              {product.originalPrice ? (
                <span className="text-sm text-[var(--color-eg-muted)] line-through">
                  {product.originalPrice}
                </span>
              ) : null}
            </div>
          </div>

          <h3 className="text-xl font-normal font-editorial leading-tight tracking-[-0.03em] text-[var(--color-eg-espresso)]">
            {product.title}
          </h3>

          {showFullDetails && product.description ? (
            <p
              className={`font-serif text-[var(--color-eg-muted)] text-sm whitespace-pre-line ${
                showDetails ? '' : 'line-clamp-2'
              }`}
            >
              {product.description}
            </p>
          ) : null}

          <Button
            size="sm"
            onClick={handleToggleDetails}
            disabled={!product.inStock}
            className="w-full"
          >
            {showDetails ? 'Hide Details' : 'View Product'}
          </Button>

          {showFullDetails && showDetails ? (
            <div className="mt-4 space-y-4 border-t border-[var(--color-eg-line)] pt-4">
              <h4 className="font-semibold font-sans text-sm uppercase tracking-[0.08em] text-[var(--color-eg-espresso)]">
                Product Details
              </h4>

              {Array.isArray(product.tags) && product.tags.length > 0 ? (
                <div>
                  <span className="text-xs font-semibold text-[var(--color-eg-muted)] uppercase tracking-[0.08em] block mb-2">
                    Features
                  </span>

                  <div className="flex gap-1 flex-wrap">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-[var(--color-eg-paper)] text-[var(--color-eg-muted)] rounded-full font-serif uppercase tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
                <div>
                  <span className="text-xs font-semibold text-[var(--color-eg-muted)] uppercase tracking-[0.08em] block mb-2">
                    Available Sizes
                  </span>

                  <div className="flex gap-1 flex-wrap">
                    {product.sizes.map((size) => (
                      <span
                        key={size}
                        className="text-xs px-2 py-1 border border-[var(--color-eg-line)] text-[var(--color-eg-muted)]"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {Array.isArray(product.colors) && product.colors.length > 0 ? (
                <div>
                  <span className="text-xs font-semibold text-[var(--color-eg-muted)] uppercase tracking-[0.08em] block mb-2">
                    Available Colors
                  </span>

                  <div className="flex gap-1 flex-wrap">
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        className="text-xs px-2 py-1 border border-[var(--color-eg-line)] text-[var(--color-eg-muted)]"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="pt-3 border-t border-[var(--color-eg-line)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-serif text-[var(--color-eg-muted)]">
                    Category: {product.category}
                  </span>

                  <Button
                    size="sm"
                    onClick={handleBuyProduct}
                    disabled={!product.inStock}
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