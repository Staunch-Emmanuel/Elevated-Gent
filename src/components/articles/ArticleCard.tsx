// src/components/articles/ArticleCard.tsx
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
}

export interface ArticleCardProps {
  article: ArticleCardArticle
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const publishDate = new Date(article.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      blueprint: 'Grooming Blueprint',
      confidence: 'Confidence & Wellness',
      occasion: 'By Occasion',
      products: 'Product Review',
      lifestyle: 'Lifestyle',
    }
    return categoryMap[category] || category
  }

  return (
    <article className="space-y-6 group">
      <Link href={`/wellness/${article.slug}`}>
        <div className="aspect-video bg-background-muted border border-black overflow-hidden relative">
          <Image
            src={article.heroImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
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

        <Link href={`/wellness/${article.slug}`}>
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
          <Link href={`/wellness/${article.slug}`}>
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
