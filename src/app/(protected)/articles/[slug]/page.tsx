import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import StructuredData from '@/components/seo/StructuredData'

import staticArticles from '@/lib/articles/data'
import type { ArticleDocument } from '@/lib/types/articles'
import { getArticleBySlugCMS } from '@/lib/firebase/articles'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

function normalizeSlug(value: string): string {
  try {
    return decodeURIComponent(value).trim().toLowerCase()
  } catch {
    return String(value).trim().toLowerCase()
  }
}

function formatDate(value: unknown): string {
  try {
    if (!value) return ''

    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    if (typeof (value as { toDate?: () => Date })?.toDate === 'function') {
      const date = (value as { toDate: () => Date }).toDate()
      if (Number.isNaN(date.getTime())) return ''
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    return ''
  } catch {
    return ''
  }
}

function normalizeCategory(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    blueprint: 'Grooming Blueprint',
    confidence: 'Confidence & Wellness',
    occasion: 'By Occasion',
    products: 'Product Review',
    lifestyle: 'Lifestyle',
    wellness: 'Wellness',
  }

  return categoryMap[category] || category
}

function renderRichText(content: string) {
  const safe = (content || '').trim()
  if (!safe) return null

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(safe)

  if (looksLikeHtml) {
    return (
      <div
        className="prose prose-lg max-w-none font-serif"
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    )
  }

  return safe.split('\n').map((line, idx) => {
    const text = line.trim()
    if (!text) return <div key={idx} className="h-4" />
    return (
      <p key={idx} className="font-serif text-[17px] leading-relaxed text-gray-800">
        {text}
      </p>
    )
  })
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)

  let article: ArticleDocument | null = await getArticleBySlugCMS(normalizedSlug)

  if (!article) {
    article =
      (staticArticles as ArticleDocument[]).find((a) => {
        const s = a.slug ? normalizeSlug(String(a.slug)) : ''
        return s === normalizedSlug
      }) ?? null
  }

  if (!article) notFound()

  const title = article.title ?? 'Article'
  const heroImage =
    article.heroImage ||
    '/images/Image-10.jpeg'

  const category = normalizeCategory(article.category)
  const categoryLabel = getCategoryName(category)

  const publishedLabel =
    formatDate(article.publishDate) ||
    formatDate(article.datePublished) ||
    formatDate(article.createdAt)

  return (
    <ProtectedRoute>
      <StructuredData pageKey="article" />

      <section className="py-16">
        <PagePadding>
          <Container>
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link
                  href="/articles"
                  className="text-sm font-serif text-gray-500 hover:text-black"
                >
                  ← Back to Articles
                </Link>
              </div>

              <div className="text-center space-y-6">
                {categoryLabel ? (
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-sans">
                    {categoryLabel}
                  </p>
                ) : null}

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold font-sans leading-tight">
                  {title}
                </h1>

                {article.excerpt ? (
                  <p className="text-lg md:text-xl font-serif text-muted leading-relaxed">
                    {article.excerpt}
                  </p>
                ) : null}

                {publishedLabel ? (
                  <div className="text-sm text-gray-500 font-serif">
                    Published · {publishedLabel}
                  </div>
                ) : null}
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>

      {heroImage ? (
        <section className="pb-10">
          <PagePadding>
            <Container>
              <div className="max-w-5xl mx-auto">
                <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <div className="relative w-full aspect-[16/9]">
                    <Image
                      src={heroImage}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 1200px"
                      priority
                    />
                  </div>
                </div>
              </div>
            </Container>
          </PagePadding>
        </section>
      ) : null}

      <section className="py-10">
        <PagePadding>
          <Container>
            <div className="max-w-3xl mx-auto space-y-5">
              {article.content ? (
                renderRichText(article.content)
              ) : (
                <p className="font-serif text-gray-600">No content yet.</p>
              )}
            </div>
          </Container>
        </PagePadding>
      </section>
    </ProtectedRoute>
  )
}