'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import { Button, Label } from '@/components/ui'

import type { OutfitShopItem } from '@/lib/firebase/outfits'

type FilterOption = {
  id: string
  label: string
  count: number
}

type SortOption = 'featured' | 'name-asc' | 'name-desc'

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
  const categoryMap = new Map<string, FilterOption>()

  items.forEach((item) => {
    const label = String(item.category || '').trim()
    const id = normalizeFilterValue(label)

    if (!label || !id) return

    const current = categoryMap.get(id)

    categoryMap.set(id, {
      id,
      label,
      count: (current?.count || 0) + 1,
    })
  })

  return [
    { id: 'all', label: 'All', count: items.length },
    ...Array.from(categoryMap.values()),
  ]
}

export default function OutfitShopGrid({
  outfitId,
  shopItems,
}: OutfitShopGridProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  const categories = useMemo(() => {
    return buildShopCategories(shopItems)
  }, [shopItems])

  const filteredItems = useMemo(() => {
    const filtered =
      activeFilter === 'all'
        ? [...shopItems]
        : shopItems.filter(
            (item) =>
              normalizeFilterValue(String(item.category || '')) ===
              activeFilter
          )

    if (sortBy === 'name-asc') {
      return filtered.sort((a, b) =>
        String(a.name || '').localeCompare(String(b.name || ''))
      )
    }

    if (sortBy === 'name-desc') {
      return filtered.sort((a, b) =>
        String(b.name || '').localeCompare(String(a.name || ''))
      )
    }

    return filtered.sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    )
  }, [activeFilter, shopItems, sortBy])

  useEffect(() => {
    const filterStillExists = categories.some(
      (category) => category.id === activeFilter
    )

    if (!filterStillExists) {
      setActiveFilter('all')
    }
  }, [activeFilter, categories])

  return (
    <div className="space-y-7 md:space-y-8">
      <div className="flex flex-col gap-4 border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-4 shadow-[0_10px_28px_rgba(36,35,29,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto pb-1">
          <div className="flex w-max min-w-full justify-start gap-2">
            {categories.map((category) => {
              const isActive = activeFilter === category.id

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveFilter(category.id)}
                  className={
                    isActive
                      ? 'inline-flex min-h-10 shrink-0 items-center justify-center border border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-cream)]'
                      : 'inline-flex min-h-10 shrink-0 items-center justify-center border border-[var(--color-eg-line)] bg-transparent px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] transition-colors hover:border-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]'
                  }
                >
                  {category.label} ({category.count})
                </button>
              )
            })}
          </div>
        </div>

        <label className="flex shrink-0 items-center gap-3">
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-muted)]">
            Sort
          </span>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as SortOption)
            }
            className="min-h-10 border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-3 py-2 font-serif text-xs text-[var(--color-eg-ink)] outline-none focus:border-[var(--color-eg-espresso-deep)]"
          >
            <option value="featured">Featured</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
          </select>
        </label>
      </div>

      {filteredItems.length === 0 ? (
        <div className="border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
          <p className="font-serif text-sm leading-7 text-[var(--color-eg-muted)]">
            No shop items added yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                  <div className="mb-2 flex items-start justify-between gap-3">
                    {shopItem.brand ? (
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-muted)]">
                        {shopItem.brand}
                      </p>
                    ) : (
                      <span />
                    )}

                    {shopItem.category ? (
                      <Label className="shrink-0 border-0 bg-transparent px-0 py-0 text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--color-eg-muted)]">
                        {shopItem.category}
                      </Label>
                    ) : null}
                  </div>

                  <h3 className="break-words text-sm font-semibold leading-snug text-[var(--color-eg-ink)] sm:text-base">
                    {shopItem.name || 'Shop Item'}
                  </h3>

                  {shopItem.price ? (
                    <p className="mt-2 font-serif text-sm font-semibold text-[var(--color-eg-espresso-deep)]">
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
                        variant="outline"
                        className="min-h-10 w-full border-[var(--color-eg-espresso-deep)] text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]"
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