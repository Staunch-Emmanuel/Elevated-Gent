'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'

import { deleteOutfit, getAllOutfits } from '@/lib/firebase/outfits'
import { getContentCategories } from '@/lib/firebase/contentCategories'

import type { OutfitDocument } from '@/lib/firebase/outfits'
import type { ProductCategory } from '@/lib/products/types'

export default function AdminOutfitsPage() {
  const [outfits, setOutfits] = useState<OutfitDocument[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)

      try {
        const [docs, categoryDocs] = await Promise.all([
          getAllOutfits(),
          getContentCategories('outfits'),
        ])

        setOutfits(docs)
        setCategories(categoryDocs)
      } catch (err) {
        console.error('Error loading outfits:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this outfit?')) return

    try {
      setDeletingId(id)
      await deleteOutfit(id)
      setOutfits((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      console.error(err)
      alert('Failed to delete outfit.')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = useMemo(() => {
    return outfits.filter((item) => {
      const searchValue = search.trim().toLowerCase()

      const matchSearch =
        item.title.toLowerCase().includes(searchValue) ||
        item.description.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue)

      const matchCategory =
        filterCategory === 'all' || item.category === filterCategory

      return matchSearch && matchCategory
    })
  }, [outfits, search, filterCategory])

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-5xl py-10 md:py-12">
          <div className="mb-8 flex flex-col gap-6 border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#625e53]">
                Content Management
              </p>

              <h1 className="font-editorial text-4xl font-normal tracking-[-0.03em] text-[#24231d]">
                Outfits
              </h1>

              <p className="mt-2 font-serif text-sm text-[#575348]">
                Manage outfit inspiration and shoppable looks.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/categories?section=outfits"
                className="border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C] transition-colors hover:bg-[#817E6C] hover:text-[#E8EBEC]"
              >
                Manage Categories
              </Link>

              <Link
                href="/admin/outfits/new"
                className="border border-[#817E6C] bg-[#817E6C] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#E8EBEC] transition-colors hover:bg-transparent hover:text-[#817E6C]"
              >
                + New Outfit
              </Link>
            </div>
          </div>

          <div className="mb-8 border border-[#817E6C] bg-[#E8EBEC] p-5 shadow-[0_12px_30px_rgba(36,35,29,0.05)]">
            <div className="space-y-4">
              <input
                placeholder="Search outfits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="min-h-12 border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none hover:border-[#817E6C] focus:border-[#817E6C]"
                >
                  <option value="all">All Categories</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <div className="flex min-h-12 items-center border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#575348]">
                  {filtered.length}{' '}
                  {filtered.length === 1 ? 'outfit' : 'outfits'}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="border border-[#817E6C] bg-[#E8EBEC] px-6 py-12 text-center">
              <p className="font-serif text-[#575348]">
                Loading outfits...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-[#817E6C] bg-[#E8EBEC] px-6 py-12 text-center">
              <p className="font-serif text-[#575348]">
                No outfits found.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filtered.map((outfit) => (
                <div
                  key={outfit.id}
                  className="flex flex-col gap-5 border border-[#817E6C] bg-[#E8EBEC] p-4 shadow-[0_10px_28px_rgba(36,35,29,0.05)] sm:flex-row sm:items-center"
                >
                  <img
                    src={
                      outfit.heroImage ||
                      '/images/placeholder-outfit.jpg'
                    }
                    alt={outfit.title}
                    className="h-48 w-full border border-[#817E6C] object-cover sm:h-28 sm:w-28"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="font-editorial text-2xl font-normal leading-tight text-[#24231d]">
                      {outfit.title}
                    </h3>

                    <p className="mt-2 font-serif text-sm text-[#575348]">
                      {outfit.category || 'Uncategorized'}
                    </p>

                    {outfit.description ? (
                      <p className="mt-2 line-clamp-2 font-serif text-sm leading-6 text-[#625e53]">
                        {outfit.description}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#817E6C] bg-[#E8EBEC] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#817E6C]">
                        {outfit.productLinks.length}{' '}
                        {outfit.productLinks.length === 1
                          ? 'link'
                          : 'links'}
                      </span>

                      {outfit.published === false ? (
                        <span className="rounded-full border border-[#b89b63] bg-[#f4ead2] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6c5428]">
                          Draft
                        </span>
                      ) : (
                        <span className="rounded-full border border-[#9aaa83] bg-[#edf3e4] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#40512f]">
                          Published
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 sm:justify-end">
                    <Link
                      href={`/admin/outfits/${outfit.id}`}
                      className="border border-[#817E6C] bg-[#817E6C] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#E8EBEC] transition-colors hover:bg-transparent hover:text-[#817E6C]"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(outfit.id)}
                      disabled={deletingId === outfit.id}
                      className="border border-[#a65a50] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {deletingId === outfit.id
                        ? 'Deleting…'
                        : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}