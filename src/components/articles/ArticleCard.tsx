'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button, Label } from '@/components/ui'

export type ArticleCardArticle = {
  slug: string
  title: string
  excerpt: string
  heroImage: string
  category: string
  publishDate: string | number | Date
  readTime: number
  featured?: boolean
  occasion?: string
  href?: string
}

export interface ArticleCardProps {
  article: ArticleCardArticle
}

function normalizeCategory(value: string): string {
  const normalized = String(value || '').trim().toLowerCase()

  if (normalized === 'blueprint') return 'grooming'
  if (normalized === 'confidence') return 'wellness'
  if (normalized === 'products' || normalized === 'occasion') return 'style'
  if (normalized === 'lifetime') return 'lifestyle'

  return normalized
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const publishDate = new Date(article.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const href = article.href ?? `/articles/${article.slug}`
  const hasHeroImage = Boolean(article.heroImage && article.heroImage.trim())

  const getCategoryName = (category: string) => {
    const normalized = normalizeCategory(category)

    const categoryMap: Record<string, string> = {
      general: 'General',
      wellness: 'Wellness',
      style: 'Style',
      grooming: 'Grooming',
      lifestyle: 'Lifestyle',
    }

    return categoryMap[normalized] || category
  }

  return (
    <article className="space-y-6 group">
      <Link href={href}>
        <div className="aspect-video bg-background-muted border border-black overflow-hidden relative flex items-center justify-center">
          {hasHeroImage ? (
            <Image
              src={article.heroImage}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 px-6 text-center">
              <span className="font-serif text-sm text-gray-500">
                {article.title}
              </span>
            </div>
          )}

          {article.featured ? (
            <div className="absolute top-4 right-4">
              <Label variant="inverse">Featured</Label>
            </div>
          ) : null}
        </div>
      </Link>

      <div className="space-y-3 mt-6">
        <div className="flex items-center gap-2">
          <Label>{getCategoryName(article.category)}</Label>
          {article.occasion ? (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-serif uppercase tracking-wide">
              {article.occasion}
            </span>
          ) : null}
        </div>

        <Link href={href}>
          <h3 className="text-lg font-semibold font-sans group-hover:underline">
            {article.title}
          </h3>
        </Link>

        <p className="font-serif text-muted text-sm line-clamp-2">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs font-serif text-muted">
          <span>
            {article.readTime} min read • {publishDate}
          </span>
        </div>

        <div className="pt-2">
          <Link href={href}>
            <Button variant="outline" size="sm">
              Read Article
            </Button>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ArticleCard