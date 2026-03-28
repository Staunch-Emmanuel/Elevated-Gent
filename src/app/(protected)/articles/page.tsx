'use client'

import { useEffect, useMemo, useState } from 'react'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import { StructuredData } from '@/components/seo/StructuredData'
import { Label } from '@/components/ui'
import ArticleCard from '@/components/articles/ArticleCard'

import type { ArticleDocument } from '@/lib/types/articles'
import type { ArticleCardArticle } from '@/components/articles/ArticleCard'
import { getAllArticlesCMS } from '@/lib/firebase/articles'

const categoryOptions = [
  { id: 'all', label: 'All' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'blueprint', label: 'Grooming Blueprint' },
  { id: 'lifestyle', label: 'Lifestyle' },
] as const

function normalizeCategory(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

function normalizeDate(value: unknown): number {
  try {
    if (!value) return 0

    if (typeof value === 'string') {
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? 0 : date.getTime()
    }

    if (typeof value === 'number') {
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? 0 : date.getTime()
    }

    if (typeof (value as { toDate?: () => Date })?.toDate === 'function') {
      const date = (value as { toDate: () => Date }).toDate()
      return Number.isNaN(date.getTime()) ? 0 : date.getTime()
    }

    return 0
  } catch {
    return 0
  }
}

function estimateReadTimeMinutes(content: string | undefined): number {
  const text = String(content ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return 1

  const wordCount = text.split(' ').filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

function mapArticleForCard(article: ArticleDocument): ArticleCardArticle {
  return {
    slug: article.slug ?? '',
    title: article.title ?? '',
    excerpt: article.excerpt ?? '',
    heroImage: article.heroImage ?? '',
    category: article.category ?? 'general',
    publishDate:
      article.publishDate ??
      article.datePublished ??
      article.createdAt ??
      new Date().toISOString(),
    readTime: estimateReadTimeMinutes(article.content),
    featured: false,
    occasion: article.occasion ?? undefined,
    href: `/articles/${article.slug ?? ''}`,
  }
}

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [cmsArticles, setCmsArticles] = useState<ArticleDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      try {
        const items = await getAllArticlesCMS()
        const sorted = [...items].sort((a, b) => {
          const aDate = normalizeDate(a.publishDate ?? a.datePublished ?? a.createdAt)
          const bDate = normalizeDate(b.publishDate ?? b.datePublished ?? b.createdAt)
          return bDate - aDate
        })
        setCmsArticles(sorted)
      } catch (error) {
        console.error('Failed to load articles:', error)
        setCmsArticles([])
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [])

  const mappedArticles = useMemo(() => {
    return cmsArticles.map(mapArticleForCard)
  }, [cmsArticles])

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'all') return mappedArticles

    return mappedArticles.filter(
      (article) => normalizeCategory(article.category) === activeCategory
    )
  }, [activeCategory, mappedArticles])

  return (
    <ProtectedRoute>
      <StructuredData pageKey="articles" />

      <section className="py-16">
        <PagePadding>
          <Container>
            <div className="text-center space-y-8">
              <div className="overflow-hidden px-4">
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-semibold font-sans leading-tight">
                  ARTICLES
                </h1>
              </div>

              <p className="text-lg md:text-xl font-serif text-muted max-w-3xl mx-auto leading-relaxed px-4">
                Explore editorial content across wellness, grooming, lifestyle, and modern style.
                Curated insights designed to help you look sharp and live well.
              </p>
            </div>
          </Container>
        </PagePadding>
      </section>

      <section className="py-16">
        <PagePadding>
          <Container>
            <div className="flex justify-center mb-12">
              <div className="flex gap-2 flex-wrap justify-center">
                {categoryOptions.map((category) => (
                  <Label
                    key={category.id}
                    variant={activeCategory === category.id ? 'inverse' : 'default'}
                    onClick={() => setActiveCategory(category.id)}
                    className="cursor-pointer"
                  >
                    {category.label}
                  </Label>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-serif">Loading articles…</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 font-serif">No articles in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}
          </Container>
        </PagePadding>
      </section>
    </ProtectedRoute>
  )
}