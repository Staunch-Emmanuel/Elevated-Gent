'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import { Button, Label } from '@/components/ui'

import type { OutfitShopItem } from '@/lib/firebase/outfits'

type FilterOption = {
  id: string
  label: string
}

type OutfitShopGridProps = {
  outfitId: string
  shopItems: OutfitShopItem[]
}

function normalizeFilterValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^\w/]+/g, '-')
    .replace(/\//g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildShopCategories(items: OutfitShopItem[]): FilterOption[] {
  const categoryMap = new Map<string, string>()

  items.forEach((item) => {
    const label = String(item.category || '').trim()
    const id = normalizeFilterValue(label)

    if (!label || !id) return

    categoryMap.set(id, label)
  })

  return [
    { id: 'all', label: 'All' },
    ...Array.from(categoryMap.entries()).map(([id, label]) => ({
      id,
      label,
    })),
  ]
}

export default function OutfitShopGrid({
  outfitId,
  shopItems,
}: OutfitShopGridProps) {
  const [activeFilter, setActiveFilter] = useState('all')

  const categories = useMemo(() => {
    return buildShopCategories(shopItems)
  }, [shopItems])

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return shopItems

    return shopItems.filter((item) => {
      return (
        normalizeFilterValue(String(item.category || '')) === activeFilter
      )
    })
  }, [activeFilter, shopItems])

  useEffect(() => {
    const filterStillExists = categories.some(
      (category) => category.id === activeFilter
    )

    if (!filterStillExists) {
      setActiveFilter('all')
    }
  }, [activeFilter, categories])

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="overflow-x-auto pb-1">
        <div className="mx-auto flex w-max min-w-full justify-start gap-2 md:justify-center">
          {categories.map((category) => {
            const isActive = activeFilter === category.id

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveFilter(category.id)}
                className={
                  isActive
                    ? 'inline-flex min-h-11 shrink-0 items-center justify-center border border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-cream)] transition-colors duration-200'
                    : 'inline-flex min-h-11 shrink-0 items-center justify-center border border-[var(--color-eg-line)] bg-transparent px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] transition-colors duration-200 hover:border-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]'
                }
              >
                {category.label}
              </button>
            )
          })}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
          <p className="font-serif text-sm leading-7 text-[var(--color-eg-muted)]">
            No shop items added yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((shopItem, index) => (
            <article
              key={shopItem.id || `${outfitId}-shop-${index}`}
              className="flex min-h-full gap-4 border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-3 shadow-[0_12px_32px_rgba(36,35,29,0.06)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-[var(--color-eg-paper-soft)] sm:h-32 sm:w-28">
                {shopItem.imageUrl ? (
                  <Image
                    src={shopItem.imageUrl}
                    alt={shopItem.name || 'Shop item'}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-3 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-muted)]">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col py-1">
                <div className="flex-1">
                  {shopItem.category ? (
                    <Label className="mb-3 border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]">
                      {shopItem.category}
                    </Label>
                  ) : null}

                  {shopItem.brand ? (
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-muted)]">
                      {shopItem.brand}
                    </p>
                  ) : null}

                  <h3 className="break-words text-sm font-semibold leading-snug text-[var(--color-eg-ink)] sm:text-base">
                    {shopItem.name || 'Shop Item'}
                  </h3>

                  {shopItem.price ? (
                    <p className="mt-2 font-serif text-sm text-[var(--color-eg-muted)]">
                      {shopItem.price}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4">
                  {shopItem.url ? (
                    <a
                      href={shopItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <Button
                        size="sm"
                        className="min-h-10 w-full border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]"
                      >
                        Open
                      </Button>
                    </a>
                  ) : (
                    <Button
                      size="sm"
                      disabled
                      className="min-h-10 w-full text-[10px] font-semibold uppercase tracking-[0.1em]"
                    >
                      No Link
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}