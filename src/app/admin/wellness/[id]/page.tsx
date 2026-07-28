'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'

import {
  getWellnessById,
  updateWellness,
  deleteWellness,
} from '@/lib/firebase/wellness'

interface WellnessDocument {
  id: string
  title: string
  slug: string
  excerpt?: string
  heroImage?: string
  content?: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AdminEditWellnessPage({ params }: PageProps) {
  const router = useRouter()

  const [wellnessId, setWellnessId] = useState<string>('')

  const [article, setArticle] = useState<WellnessDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const resolved = await params

        if (!mounted) return

        setWellnessId(resolved.id)
      } catch (e) {
        console.error(e)

        if (!mounted) return

        setError('Invalid route params.')
        setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [params])

  useEffect(() => {
    async function load() {
      if (!wellnessId) return

      setLoading(true)

      const doc = await getWellnessById(wellnessId)

      if (!doc) {
        setError('Wellness article not found')
        setLoading(false)
        return
      }

      const normalized: WellnessDocument = {
        id: doc.id ?? wellnessId,
        title: doc.title ?? '',
        slug: doc.slug ?? '',
        excerpt: doc.excerpt ?? '',
        heroImage: doc.heroImage ?? '',
        content: doc.content ?? '',
      }

      setArticle(normalized)
      setTitle(normalized.title)
      setSlug(normalized.slug)
      setExcerpt(normalized.excerpt ?? '')
      setHeroImage(normalized.heroImage ?? '')
      setContent(normalized.content ?? '')

      setLoading(false)
    }

    load()
  }, [wellnessId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!article) return

    setSaving(true)
    setError('')

    try {
      await updateWellness(wellnessId, {
        title,
        slug,
        excerpt,
        heroImage,
        content,
      })

      router.push('/admin/wellness')
    } catch (err) {
      console.error(err)
      setError('Failed to update wellness article.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this wellness article?')) return

    await deleteWellness(wellnessId)
    router.push('/admin/wellness')
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <PagePadding>
          <Container>
            <div className="py-12">
              <div className="border border-[#817E6C] bg-[#E8EBEC] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
                <p className="font-serif text-[#575348]">Loading...</p>
              </div>
            </div>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  if (!article) {
    return (
      <ProtectedRoute>
        <PagePadding>
          <Container>
            <div className="py-12">
              <div className="border border-[#817E6C] bg-[#E8EBEC] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
                <p className="font-serif text-[#575348]">
                  Wellness article not found.
                </p>
              </div>
            </div>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="max-w-4xl py-10 md:py-12">
          <div className="mb-8 flex flex-col gap-5 border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#625e53]">
                Wellness Management
              </p>

              <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
                Edit Wellness Article
              </h1>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              className="border border-[#a65a50] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#E8EBEC]"
            >
              Delete
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-7 border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.06)] sm:p-8"
          >
            {error ? (
              <p className="border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
                {error}
              </p>
            ) : null}

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Slug
              </label>

              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="min-h-12 w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-mono text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Excerpt
              </label>

              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="min-h-[130px] w-full border border-[#817E6C] bg-[#E8EBEC] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                rows={3}
              />
            </div>

            <div className="border border-[#817E6C] bg-[#E8EBEC] p-5">
              <CMSImageUploadField
                label="Hero Image"
                folder="wellness"
                documentSlug={slug || title}
                mode="single"
                value={heroImage}
                onChange={(value) =>
                  setHeroImage(typeof value === 'string' ? value : '')
                }
                helpText="Replace or remove the current wellness hero image."
                disabled={saving}
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817E6C]">
                Content (HTML)
              </label>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[420px] w-full border border-[#817E6C] bg-[#24231d] px-4 py-4 font-mono text-sm leading-6 text-[#E8EBEC] outline-none placeholder:text-[#817E6C] placeholder:opacity-100 hover:border-[#817E6C] focus:border-[#817E6C]"
                rows={12}
              />
            </div>

            <div className="border-t border-[#817E6C] pt-6">
              <button
                type="submit"
                disabled={saving}
                className="border border-[#817E6C] bg-[#817E6C] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#E8EBEC] transition-colors hover:bg-transparent hover:text-[#817E6C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}