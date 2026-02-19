// src/app/(protected)/articles/[slug]/page.tsx
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

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)

  // 1) Try CMS
  let article: ArticleDocument | null = await getArticleBySlugCMS(normalizedSlug)

  // 2) Fallback to static
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
    (article as any).heroImage ||
    (article as any).seo?.ogImage ||
    '/images/Image-10.jpeg'

  return (
    <ProtectedRoute>
      <StructuredData pageKey="article" />

      <section className="py-12">
        <PagePadding>
          <Container className="max-w-4xl">
            <div className="mb-6">
              <Link
                href="/articles"
                className="text-sm font-serif text-gray-500 hover:text-black"
              >
                ← Back to Articles
              </Link>
            </div>

            <div className="space-y-6 mb-10">
              <h1 className="text-3xl md:text-5xl font-bold font-sans leading-tight">
                {title}
              </h1>

              {article.excerpt ? (
                <p className="text-xl font-serif text-gray-600 leading-relaxed">
                  {article.excerpt}
                </p>
              ) : null}
            </div>

            <div className="aspect-video relative rounded-lg overflow-hidden border border-gray-200 mb-12">
              <Image
                src={heroImage}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </Container>
        </PagePadding>
      </section>

      <section className="py-8">
        <PagePadding>
          <Container className="max-w-4xl">
            {article.content ? (
              <div
                className="prose prose-lg max-w-none font-serif"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <p className="font-serif text-gray-600">No content yet.</p>
            )}
          </Container>
        </PagePadding>
      </section>
    </ProtectedRoute>
  )
}
