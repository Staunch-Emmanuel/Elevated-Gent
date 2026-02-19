'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button, Label } from '@/components/ui'
import type { OutfitLook } from '@/lib/products/types'
import { getShoppableLink, trackAffiliateClick } from '@/lib/products/utils'

interface OutfitCardProps {
  outfit: OutfitLook
}

export function OutfitCard({ outfit }: OutfitCardProps) {
  const [showProducts, setShowProducts] = useState(false)

  const handleShopLook = () => {
    setShowProducts((v) => !v)
  }

  const handleBuyProduct = (product: any) => {
    const url = getShoppableLink(product)
    trackAffiliateClick(product.id, product.affiliateLink)
    window.open(url, '_blank')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Outfit Hero Image */}
      <div className="aspect-[4/5] bg-background-muted relative overflow-hidden">
        <Image
          src={outfit.heroImage || '/images/placeholder-outfit.jpg'}
          alt={outfit.title || 'Outfit'}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <Label className="text-xs">{outfit.occasion}</Label>
        </div>
        <div className="absolute top-4 right-4">
          <Label variant="inverse" className="text-xs">
            {outfit.styleType}
          </Label>
        </div>
      </div>

      {/* Outfit Details */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold font-sans">{outfit.title}</h3>

          {outfit.description ? (
            <p className="font-serif text-gray-600 text-sm">
              {outfit.description}
            </p>
          ) : null}

          <div className="flex items-center justify-between text-sm">
            <span className="font-serif text-gray-500">{outfit.season}</span>
            <span className="text-lg font-semibold">
              ${Number(outfit.totalPrice || 0)}
            </span>
          </div>
        </div>

        <Button onClick={handleShopLook} className="w-full">
          {showProducts ? 'Hide Products' : 'Shop This Look'}
        </Button>

        {/* Product Breakdown */}
        {showProducts && (
          <div className="mt-6 space-y-4 border-t border-gray-200 pt-4">
            <h4 className="font-semibold font-sans text-sm uppercase tracking-wide">
              Complete Look ({outfit.products?.length || 0} items)
            </h4>

            <div className="space-y-3">
              {(outfit.products || []).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-16 h-16 bg-white rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={product.image || '/images/placeholder-product.jpg'}
                      alt={product.title || 'Product'}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="text-xs font-serif text-gray-500 uppercase tracking-wide">
                      {product.brand}
                    </div>
                    <div className="font-semibold text-sm truncate">
                      {product.title}
                    </div>
                    <div className="text-sm font-semibold">
                      {product.price}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBuyProduct(product)}
                    className="flex-shrink-0 text-xs"
                  >
                    Buy
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="font-semibold">Total Look</span>
              <span className="text-lg font-semibold">
                ${Number(outfit.totalPrice || 0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OutfitCard
