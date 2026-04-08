'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'
import { createArticle } from '@/lib/firebase/articles'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeCategory(value: string) {
  const normalized = String(value || '').trim().toLowerCase()

  if (normalized === 'blueprint') return 'grooming'
  if (normalized === 'confidence') return 'wellness'
  if (normalized === 'products' || normalized === 'occasion') return 'style'
  if (normalized === 'lifetime') return 'lifestyle'

  if (
    normalized === 'general' ||
    normalized === 'wellness' ||
    normalized === 'style' ||
    normalized === 'grooming' ||
    normalized === 'lifestyle'
  ) {
    return normalized
  }

  return 'general'
}

export default function AdminNewArticlePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('general')
  const [heroImage, setHeroImage] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slug) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await createArticle({
        title,
        slug,
        excerpt,
        category: normalizeCategory(category),
        heroImage,
        content,
      })

      router.push('/admin/articles')
    } catch (err) {
      console.error(err)
      setError('Failed to create article. Please try again.')
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">New Article</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <p className="text-sm text-red-600 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            ) : null}

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="w-full border rounded-md px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(normalizeCategory(e.target.value))}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="general">General</option>
                <option value="wellness">Wellness</option>
                <option value="style">Style</option>
                <option value="grooming">Grooming</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>

            <CMSImageUploadField
              label="Hero Image"
              folder="articles"
              documentSlug={slug || slugify(title)}
              mode="single"
              value={heroImage}
              onChange={(value) => setHeroImage(typeof value === 'string' ? value : '')}
              helpText="Upload the main article image to Firebase Storage."
              disabled={saving}
            />

            <div>
              <label className="block text-sm font-medium mb-1">
                Content (HTML)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm font-mono"
                rows={12}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-black text-white text-sm disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Create Article'}
            </button>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}