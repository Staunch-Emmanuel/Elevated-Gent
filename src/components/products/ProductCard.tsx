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
    <div className={`space-y-4 ${className}`}>
      <div className="aspect-square bg-background-muted border border-black overflow-hidden relative">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/10" />

        <div className="absolute top-4 left-4">
          <Label>{product.category}</Label>
        </div>

        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          className="absolute bottom-4 right-4 z-10 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-sm hover:bg-black hover:text-white transition-colors disabled:opacity-60"
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
            <div className="bg-red-600 text-white text-xs px-2 py-1 rounded text-center font-semibold">
              OUT OF STOCK
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-serif text-gray-500 uppercase tracking-wide">
            {product.brand}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-semibold">{product.price}</span>
            {product.originalPrice ? (
              <span className="text-sm text-gray-500 line-through">
                {product.originalPrice}
              </span>
            ) : null}
          </div>
        </div>

        <h3 className="text-lg font-semibold font-sans">{product.title}</h3>

        {showFullDetails && product.description ? (
          <p
            className={`font-serif text-muted text-sm whitespace-pre-line ${
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
          <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
            <h4 className="font-semibold font-sans text-sm uppercase tracking-wide">
              Product Details
            </h4>

            {Array.isArray(product.tags) && product.tags.length > 0 ? (
              <div>
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-2">
                  Features
                </span>
                <div className="flex gap-1 flex-wrap">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-serif uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
              <div>
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-2">
                  Available Sizes
                </span>
                <div className="flex gap-1 flex-wrap">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-600"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {Array.isArray(product.colors) && product.colors.length > 0 ? (
              <div>
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-2">
                  Available Colors
                </span>
                <div className="flex gap-1 flex-wrap">
                  {product.colors.map((color) => (
                    <span
                      key={color}
                      className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-600"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-serif text-gray-500">
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
  )
}

export default ProductCard