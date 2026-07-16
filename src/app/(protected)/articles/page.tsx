'use client'

import { useEffect, useMemo, useState } from 'react'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import { StructuredData } from '@/components/seo/StructuredData'
import { Label } from '@/components/ui'
import ArticleCard from '@/components/articles/ArticleCard'

import type { ArticleDocument } from '@/lib/types/articles'
import type { ArticleCardArticle } from '@/components/articles/ArticleCard'
import { getPublishedArticlesCMS } from '@/lib/firebase/articles'

type CategoryOption = {
  id: string
  label: string
}

function normalizeCategorySlug(value: unknown): string {
  return (
    String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'general'
  )
}

function normalizeCategoryLabel(value: unknown): string {
  const raw = String(value ?? '').trim()
  if (!raw) return 'General'
  return raw
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
    category: normalizeCategorySlug(article.category ?? 'general'),
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

function buildCategoryOptions(articles: ArticleDocument[]): CategoryOption[] {
  const categoryMap = new Map<string, CategoryOption>()

  categoryMap.set('all', { id: 'all', label: 'All' })

  articles.forEach((article) => {
    const id = normalizeCategorySlug(article.category)
    const label = normalizeCategoryLabel(article.category)

    if (!categoryMap.has(id)) {
      categoryMap.set(id, { id, label })
    }
  })

  if (!categoryMap.has('general')) {
    categoryMap.set('general', { id: 'general', label: 'General' })
  }

  return Array.from(categoryMap.values())
}

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [cmsArticles, setCmsArticles] = useState<ArticleDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      try {
        const items = await getPublishedArticlesCMS()
        const sorted = [...items].sort((a, b) => {
          const aDate = normalizeDate(
            a.publishDate ?? a.datePublished ?? a.createdAt
          )
          const bDate = normalizeDate(
            b.publishDate ?? b.datePublished ?? b.createdAt
          )
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

    void loadArticles()
  }, [])

  const categoryOptions = useMemo(() => {
    return buildCategoryOptions(cmsArticles)
  }, [cmsArticles])

  const mappedArticles = useMemo(() => {
    return cmsArticles.map(mapArticleForCard)
  }, [cmsArticles])

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'all') return mappedArticles

    return mappedArticles.filter(
      (article) =>
        normalizeCategorySlug(article.category) === activeCategory
    )
  }, [activeCategory, mappedArticles])

  useEffect(() => {
    if (activeCategory === 'all') return

    const stillExists = categoryOptions.some(
      (category) => category.id === activeCategory
    )

    if (!stillExists) {
      setActiveCategory('all')
    }
  }, [activeCategory, categoryOptions])

  return (
    <ProtectedRoute>
      <StructuredData pageKey="articles" />

      <section className="border-b border-[rgba(243,237,226,0.22)] bg-[var(--color-eg-espresso)] py-16 text-[var(--color-eg-cream)] md:py-20">
        <PagePadding>
          <Container>
            <div className="space-y-8 text-center">
              <div className="overflow-hidden px-4">
                <h1 className="eg-editorial-heading text-5xl text-[var(--color-eg-cream)] md:text-7xl lg:text-8xl">
                  ARTICLES
                </h1>
              </div>

              <p className="mx-auto max-w-3xl px-4 font-serif text-lg leading-relaxed text-[rgba(243,237,226,0.92)] md:text-xl">
                Explore editorial content across wellness, grooming, lifestyle,
                and modern style. Curated insights designed to help you look
                sharp and live well.
              </p>
            </div>
          </Container>
        </PagePadding>
      </section>

      <section className="bg-[var(--color-eg-paper)] py-16 md:py-20">
        <PagePadding>
          <Container>
            <div className="mb-12 flex justify-center">
              <div className="flex flex-wrap justify-center gap-2">
                {categoryOptions.map((category) => {
                  const active = activeCategory === category.id

                  return (
                    <Label
                      key={category.id}
                      variant={active ? 'inverse' : 'default'}
                      onClick={() => setActiveCategory(category.id)}
                      className={
                        active
                          ? 'cursor-pointer border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)]'
                          : 'cursor-pointer border-[rgba(41,40,32,0.34)] bg-transparent text-[var(--color-eg-ink)] transition hover:border-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]'
                      }
                    >
                      {category.label}
                    </Label>
                  )
                })}
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <p className="font-serif text-[rgba(41,40,32,0.68)]">
                  Loading articles…
                </p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-serif text-[rgba(41,40,32,0.72)]">
                  No articles in this category yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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