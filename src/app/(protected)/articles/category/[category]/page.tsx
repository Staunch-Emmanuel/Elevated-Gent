import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import { StructuredData } from '@/components/seo/StructuredData'
import ArticleCard from '@/components/articles/ArticleCard'

import staticArticles from '@/lib/articles/data'
import type { ArticleDocument } from '@/lib/types/articles'
import type { ArticleCardArticle } from '@/components/articles/ArticleCard'
import { getAllArticlesCMS } from '@/lib/firebase/articles'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{
    category: string
  }>
}

type CombinedArticle = ArticleDocument & {
  source: 'static' | 'cms'
  normalizedDate: number
}

const CATEGORY_CONFIG: Record<
  string,
  {
    title: string
    description: string
  }
> = {
  general: {
    title: 'GENERAL',
    description:
      'Editorial pieces and guidance across style, wellness, and modern living.',
  },
  wellness: {
    title: 'WELLNESS',
    description:
      'Guidance on wellness, healthy routines, and everyday habits that support confidence and personal style.',
  },
  grooming: {
    title: 'GROOMING',
    description:
      'Foundational grooming advice for the modern gentleman, from skincare to maintenance routines.',
  },
  style: {
    title: 'STYLE',
    description:
      'Editorial content focused on dressing well, shopping better, and refining personal style.',
  },
  lifestyle: {
    title: 'LIFESTYLE',
    description:
      'Modern lifestyle content designed to complement a refined wardrobe and intentional living.',
  },
}

function normalizeCategory(value: unknown): string {
  const normalized = String(value ?? '').trim().toLowerCase()

  if (normalized === 'blueprint') return 'grooming'
  if (normalized === 'confidence') return 'wellness'
  if (normalized === 'products' || normalized === 'occasion') return 'style'
  if (normalized === 'lifetime') return 'lifestyle'

  return normalized || 'general'
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

function mergeBySlug(
  staticItems: CombinedArticle[],
  cmsItems: CombinedArticle[]
): CombinedArticle[] {
  const map = new Map<string, CombinedArticle>()

  for (const item of staticItems) {
    const slug = String(item.slug ?? '').trim().toLowerCase()
    if (!slug) continue
    map.set(slug, item)
  }

  for (const item of cmsItems) {
    const slug = String(item.slug ?? '').trim().toLowerCase()
    if (!slug) continue
    map.set(slug, item)
  }

  return Array.from(map.values())
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

function mapArticleForCard(article: CombinedArticle): ArticleCardArticle {
  return {
    slug: article.slug ?? '',
    title: article.title ?? '',
    excerpt: article.excerpt ?? '',
    heroImage: article.heroImage ?? '',
    category: normalizeCategory(article.category ?? 'general'),
    publishDate:
      article.publishDate ??
      article.datePublished ??
      article.createdAt ??
      new Date().toISOString(),
    readTime: estimateReadTimeMinutes(article.content),
    featured:
      (article as CombinedArticle & { featured?: boolean }).featured ?? false,
    occasion: article.occasion ?? undefined,
    href: `/articles/${article.slug ?? ''}`,
  }
}

export default async function ArticleCategoryPage({
  params,
}: PageProps) {
  const { category } = await params
  const normalizedCategory = normalizeCategory(category)

  const categoryConfig = CATEGORY_CONFIG[normalizedCategory]

  if (!categoryConfig) {
    notFound()
  }

  const cms = await getAllArticlesCMS()

  const cmsMapped: CombinedArticle[] = (cms ?? []).map((a) => ({
    ...a,
    category: normalizeCategory(a.category),
    source: 'cms',
    normalizedDate: normalizeDate(
      a.publishDate ?? a.datePublished ?? a.createdAt
    ),
  }))

  const staticMapped: CombinedArticle[] = (staticArticles ?? []).map((a) => ({
    ...a,
    category: normalizeCategory(a.category),
    source: 'static',
    normalizedDate: normalizeDate(
      a.publishDate ?? a.datePublished ?? a.createdAt
    ),
  }))

  const merged = mergeBySlug(staticMapped, cmsMapped)
    .filter(
      (article) =>
        normalizeCategory(article.category) === normalizedCategory
    )
    .sort((a, b) => b.normalizedDate - a.normalizedDate)
    .map(mapArticleForCard)

  return (
    <ProtectedRoute>
      <StructuredData pageKey="articles" />

      <div className="min-h-screen bg-[var(--color-eg-espresso)]">
        <section className="border-b border-[rgba(232,235,236,0.22)] bg-[var(--color-eg-espresso)] py-16 text-[var(--color-eg-cream)] md:py-20">
          <PagePadding>
            <Container>
              <div className="space-y-8 text-center">
                <div className="overflow-hidden px-4">
                  <h1 className="eg-editorial-heading text-5xl text-[var(--color-eg-cream)] md:text-7xl lg:text-8xl">
                    {categoryConfig.title}
                  </h1>
                </div>

                <p className="mx-auto max-w-3xl px-4 font-serif text-lg leading-relaxed text-[rgba(232,235,236,0.92)] md:text-xl">
                  {categoryConfig.description}
                </p>
              </div>
            </Container>
          </PagePadding>
        </section>

        <section className="bg-[var(--color-eg-paper)] py-16 md:py-20">
          <PagePadding>
            <Container>
              {merged.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-serif text-[rgba(41,40,32,0.72)]">
                    No articles in this category yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {merged.map((article) => (
                    <ArticleCard
                      key={article.slug}
                      article={article}
                    />
                  ))}
                </div>
              )}
            </Container>
          </PagePadding>
        </section>
      </div>
    </ProtectedRoute>
  )
}