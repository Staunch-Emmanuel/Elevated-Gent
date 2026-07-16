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
    <article className="group flex h-full flex-col border border-[#b9ae9d] bg-[#f8f1e5] p-3 text-[#24231d] shadow-[0_14px_36px_rgba(24,23,17,0.08)] transition-transform duration-300 hover:-translate-y-1 sm:p-4">
      <Link href={href} className="block">
        <div className="relative flex aspect-video items-center justify-center overflow-hidden border border-[#b9ae9d] bg-[#e9dfd1]">
          {hasHeroImage ? (
            <Image
              src={article.heroImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#f2eadf] px-6 text-center">
              <span className="font-serif text-sm leading-6 text-[#575348]">
                {article.title}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,23,17,0.01)_0%,rgba(24,23,17,0.12)_100%)]" />

          {article.featured ? (
            <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
              <Label
                variant="inverse"
                className="border-[#4f4b3b] bg-[#4f4b3b] text-[#f8f1e5]"
              >
                Featured
              </Label>
            </div>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col space-y-4 px-1 pb-1 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Label className="border-[#77725d] bg-[#f2eadf] text-[#4f4b3b]">
            {getCategoryName(article.category)}
          </Label>

          {article.occasion ? (
            <span className="rounded-full border border-[#c8bcaa] bg-[#f2eadf] px-3 py-1.5 font-serif text-xs uppercase tracking-[0.1em] text-[#575348]">
              {article.occasion}
            </span>
          ) : null}
        </div>

        <Link href={href}>
          <h3 className="font-editorial text-2xl font-normal leading-tight tracking-[-0.03em] text-[#24231d] group-hover:underline md:text-3xl">
            {article.title}
          </h3>
        </Link>

        <p className="line-clamp-2 flex-1 font-serif text-sm leading-7 text-[#575348]">
          {article.excerpt}
        </p>

        <div className="border-t border-[#d8cdbd] pt-4">
          <div className="mb-4 flex items-center justify-between font-serif text-xs text-[#625e53]">
            <span>
              {article.readTime} min read • {publishDate}
            </span>
          </div>

          <Link href={href} className="block">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#4f4b3b] text-[#4f4b3b] hover:bg-[#4f4b3b] hover:text-[#f8f1e5]"
            >
              Read Article
            </Button>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ArticleCard