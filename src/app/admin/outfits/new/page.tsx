'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'

import { createOutfit, type OutfitShopItem } from '@/lib/firebase/outfits'
import {
  createContentCategory,
  getContentCategories,
} from '@/lib/firebase/contentCategories'
import type { ShoppableLink, ProductCategory } from '@/lib/products/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeLinks(links: ShoppableLink[]): ShoppableLink[] {
  return links
    .map((link) => ({
      label: link.label.trim(),
      url: link.url.trim(),
    }))
    .filter((link) => Boolean(link.url))
}

export default function AdminNewOutfitPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<ProductCategory[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [category, setCategory] = useState<string>('')
  const [featured, setFeatured] = useState(false)
  const [published, setPublished] = useState(true)
  const [sortWeight, setSortWeight] = useState<number>(0)
  const [productLinks, setProductLinks] = useState<ShoppableLink[]>([
    { label: '', url: '' },
  ])
  const [shopItems, setShopItems] = useState<OutfitShopItem[]>([])

  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadOutfitCategories() {
    const docs = await getContentCategories('outfits')
    setCategories(docs)

    if (!category && docs.length > 0) {
      setCategory(docs[0].name)
    }

    return docs
  }

  useEffect(() => {
    async function loadCategories() {
      try {
        await loadOutfitCategories()
      } catch (err) {
        console.error('Failed to load outfit categories:', err)
      }
    }

    void loadCategories()
  }, [])

  function updateLink(index: number, field: keyof ShoppableLink, value: string) {
    setProductLinks((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  function addLinkField() {
    setProductLinks((current) => [...current, { label: '', url: '' }])
  }

  function removeLinkField(index: number) {
    setProductLinks((current) => {
      const next = current.filter((_, i) => i !== index)
      return next.length > 0 ? next : [{ label: '', url: '' }]
    })
  }

  function addShopItem() {
    setShopItems((current) => [
      ...current,
      {
        id: `shop-item-${Date.now()}`,
        name: '',
        brand: '',
        url: '',
        imageUrl: '',
        category: '',
        price: '',
        sortOrder: current.length,
      },
    ])
  }

  function updateShopItem(
    index: number,
    field: keyof OutfitShopItem,
    value: string | number
  ) {
    setShopItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    )
  }

  function removeShopItem(index: number) {
    setShopItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    )
  }

  function moveShopItem(index: number, direction: -1 | 1) {
    setShopItems((current) => {
      const next = [...current]
      const targetIndex = index + direction

      if (targetIndex < 0 || targetIndex >= next.length) {
        return current
      }

      const [moved] = next.splice(index, 1)
      next.splice(targetIndex, 0, moved)

      return next.map((item, itemIndex) => ({
        ...item,
        sortOrder: itemIndex,
      }))
    })
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) {
      setCategoryError('Category name is required.')
      return
    }

    setCreatingCategory(true)
    setCategoryError('')

    try {
      await createContentCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
        section: 'outfits',
      })

      const updatedCategories = await loadOutfitCategories()
      const created = updatedCategories.find(
        (item) =>
          item.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      )

      if (created) {
        setCategory(created.name)
      }

      setNewCategoryName('')
      setNewCategoryDescription('')
      setShowNewCategoryForm(false)
    } catch (err) {
      console.error(err)
      setCategoryError(
        err instanceof Error ? err.message : 'Failed to create category.'
      )
    } finally {
      setCreatingCategory(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const cleanedLinks = sanitizeLinks(productLinks)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    if (!description.trim()) {
      setError('Description is required.')
      return
    }

    if (!category.trim()) {
      setError('Category is required.')
      return
    }

    if (!heroImage.trim()) {
      setError('Hero image is required.')
      return
    }

    if (cleanedLinks.length === 0 && shopItems.length === 0) {
      setError('Add at least one structured shop item or product link.')
      return
    }

    setSaving(true)

    try {
      await createOutfit({
        slug: slugify(title),
        title: title.trim(),
        description: description.trim(),
        heroImage: heroImage.trim(),
        galleryImages,
        category: category.trim(),
        productLinks: cleanedLinks,
        shopItems: shopItems.map((item, index) => ({
          ...item,
          sortOrder: index,
        })),
        featured,
        published,
        sortWeight: Number(sortWeight) || 0,
      })

      router.push('/admin/outfits')
    } catch (err) {
      console.error('Error creating outfit:', err)
      setError('Failed to create outfit. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-4xl py-10 md:py-12">
          <div className="mb-8 flex flex-col gap-5 border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 md:flex-row md:items-center md:justify-between">
            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              New Outfit Look
            </h1>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push('/admin/categories?section=outfits')
                }
                className="border border-[#817E6C] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#817E6C] transition-colors hover:bg-[#817E6C] hover:text-[#E8EBEC]"
              >
                Manage Categories
              </button>

              <button
                type="button"
                onClick={() => router.push('/admin/outfits')}
                className="border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#817E6C] transition-colors hover:border-[#817E6C] hover:bg-[#817E6C] hover:text-[#E8EBEC]"
              >
                Back to Outfits
              </button>
            </div>
          </div>

          {error ? (
            <div className="mb-6 border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
              {error}
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="space-y-7 border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.06)] sm:p-8"
          >
            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                placeholder="e.g. Smart Casual Weekend Look"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[140px] w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                placeholder="Short description of the outfit, where to wear it, what it communicates..."
                required
              />
            </div>

            <div className="space-y-4 border border-[#817E6C] bg-[#E8EBEC] p-5">
              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none hover:border-[#817E6C] focus:border-[#817E6C]"
                  required
                >
                  <option value="">Select category</option>

                  {categories.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryForm((current) => !current)
                    setCategoryError('')
                  }}
                  className="font-serif text-sm font-semibold text-[#817E6C] underline underline-offset-4 transition-colors hover:text-[#24231d]"
                >
                  {showNewCategoryForm
                    ? 'Cancel new category'
                    : 'Add new category'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push('/admin/categories?section=outfits')
                  }
                  className="font-serif text-sm text-[#625e53] underline underline-offset-4 transition-colors hover:text-[#24231d]"
                >
                  Open full category manager
                </button>
              </div>

              {showNewCategoryForm ? (
                <div className="space-y-4 border border-[#817E6C] bg-[#E8EBEC] p-5">
                  <div>
                    <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                      New category name
                    </label>

                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                      placeholder="e.g. Vacation"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                      Description (optional)
                    </label>

                    <textarea
                      value={newCategoryDescription}
                      onChange={(e) =>
                        setNewCategoryDescription(e.target.value)
                      }
                      className="min-h-[100px] w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                    />
                  </div>

                  {categoryError ? (
                    <p className="border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
                      {categoryError}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void handleCreateCategory()}
                    disabled={creatingCategory}
                    className="border border-[#817E6C] bg-[#817E6C] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#E8EBEC] transition-colors hover:bg-transparent hover:text-[#817E6C] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingCategory ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="border border-[#817E6C] bg-[#E8EBEC] p-5">
              <CMSImageUploadField
                label="Hero Image"
                folder="outfits"
                documentSlug={slugify(title)}
                mode="single"
                value={heroImage}
                onChange={(value) =>
                  setHeroImage(typeof value === 'string' ? value : '')
                }
                helpText="Main image used for the card and top of the outfit page."
                disabled={saving}
              />
            </div>

            <div className="border border-[#817E6C] bg-[#E8EBEC] p-5">
              <CMSImageUploadField
                label="Gallery Images"
                folder="outfits"
                documentSlug={slugify(title)}
                mode="multiple"
                value={galleryImages}
                onChange={(value) =>
                  setGalleryImages(Array.isArray(value) ? value : [])
                }
                helpText="Optional extra images for the outfit gallery."
                disabled={saving}
              />
            </div>

            <div className="flex flex-wrap items-end gap-6 border border-[#817E6C] bg-[#E8EBEC] p-5">
              <label className="inline-flex items-center gap-3 font-serif text-sm text-[#24231d]">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 accent-[#817E6C]"
                />
                <span>Featured outfit</span>
              </label>

              <label className="inline-flex items-center gap-3 font-serif text-sm text-[#24231d]">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 accent-[#817E6C]"
                />
                <span>Published</span>
              </label>

              <div>
                <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[#817E6C]">
                  Sort Weight (optional)
                </label>

                <input
                  type="number"
                  value={sortWeight}
                  onChange={(e) =>
                    setSortWeight(Number(e.target.value || 0))
                  }
                  className="min-h-10 w-32 border border-[#817E6C] bg-[#E8EBEC] px-3 py-2 font-serif text-sm text-[#24231d] outline-none hover:border-[#817E6C] focus:border-[#817E6C]"
                />
              </div>
            </div>

            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                    Shop the Look Items
                  </label>

                  <p className="mt-2 font-serif text-xs leading-5 text-[#625e53]">
                    Add each product image, category, brand, price, and link.
                    These items power the categorized layout shown on the live
                    outfit page.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addShopItem}
                  className="shrink-0 border border-[#817E6C] bg-[#817E6C] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#E8EBEC] transition-colors hover:bg-transparent hover:text-[#817E6C]"
                >
                  + Add Shop Item
                </button>
              </div>

              {shopItems.length === 0 ? (
                <div className="border border-dashed border-[#817E6C] bg-[#E8EBEC] px-5 py-10 text-center font-serif text-sm text-[#625e53]">
                  No structured shop items yet.
                </div>
              ) : (
                <div className="space-y-5">
                  {shopItems.map((shopItem, index) => (
                    <div
                      key={shopItem.id || index}
                      className="space-y-5 border border-[#817E6C] bg-[#E8EBEC] p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                          Shop Item {index + 1}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => moveShopItem(index, -1)}
                            disabled={index === 0}
                            className="border border-[#817E6C] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#817E6C] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Up
                          </button>

                          <button
                            type="button"
                            onClick={() => moveShopItem(index, 1)}
                            disabled={
                              index === shopItems.length - 1
                            }
                            className="border border-[#817E6C] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#817E6C] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Down
                          </button>

                          <button
                            type="button"
                            onClick={() => removeShopItem(index)}
                            className="border border-[#a65a50] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#E8EBEC]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[#817E6C]">
                            Product Name
                          </label>
                          <input
                            value={shopItem.name}
                            onChange={(event) =>
                              updateShopItem(index, 'name', event.target.value)
                            }
                            className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none"
                            placeholder="e.g. Cashmere Tee"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[#817E6C]">
                            Brand
                          </label>
                          <input
                            value={shopItem.brand}
                            onChange={(event) =>
                              updateShopItem(index, 'brand', event.target.value)
                            }
                            className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none"
                            placeholder="e.g. Buck Mason"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[#817E6C]">
                            Item Category
                          </label>
                          <input
                            value={shopItem.category}
                            onChange={(event) =>
                              updateShopItem(
                                index,
                                'category',
                                event.target.value
                              )
                            }
                            className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none"
                            placeholder="e.g. Top, Pants, Accessory"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[#817E6C]">
                            Price
                          </label>
                          <input
                            value={shopItem.price || ''}
                            onChange={(event) =>
                              updateShopItem(index, 'price', event.target.value)
                            }
                            className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none"
                            placeholder="e.g. $98"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[#817E6C]">
                          Product URL
                        </label>
                        <input
                          type="url"
                          value={shopItem.url}
                          onChange={(event) =>
                            updateShopItem(index, 'url', event.target.value)
                          }
                          className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none"
                          placeholder="https://example.com/product"
                        />
                      </div>

                      <CMSImageUploadField
                        label="Product Image"
                        folder="outfits/shop-items"
                        documentSlug={`${slugify(title || 'outfit')}-${index + 1}`}
                        mode="single"
                        value={shopItem.imageUrl}
                        onChange={(value) =>
                          updateShopItem(
                            index,
                            'imageUrl',
                            typeof value === 'string' ? value : ''
                          )
                        }
                        helpText="Upload the individual product image."
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-3 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Product Links
              </label>

              <div className="space-y-4">
                {productLinks.map((link, index) => (
                  <div
                    key={index}
                    className="space-y-4 border border-[#817E6C] bg-[#E8EBEC] p-5"
                  >
                    <div>
                      <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[#817E6C]">
                        Link Name
                      </label>

                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) =>
                          updateLink(index, 'label', e.target.value)
                        }
                        className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                        placeholder="e.g. Blazer, Shoes, Watch"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          updateLink(index, 'url', e.target.value)
                        }
                        className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                        placeholder="https://example.com/product"
                      />

                      <button
                        type="button"
                        onClick={() => removeLinkField(index)}
                        className="border border-[#a65a50] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#E8EBEC]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addLinkField}
                className="mt-4 font-serif text-sm font-semibold text-[#817E6C] underline underline-offset-4 transition-colors hover:text-[#24231d]"
              >
                + Add another link
              </button>

              <p className="mt-3 font-serif text-xs leading-5 text-[#625e53]">
                Add one or more external product URLs and optional custom names
                for each one.
              </p>
            </div>

            <div className="border-t border-[#817E6C] pt-6">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center border border-[#817E6C] bg-[#817E6C] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#E8EBEC] transition-colors hover:bg-transparent hover:text-[#817E6C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Create Outfit'}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}