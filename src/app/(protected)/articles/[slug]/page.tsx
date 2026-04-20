import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import StructuredData from '@/components/seo/StructuredData'

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
  const normalized = String(value ?? '').trim().toLowerCase()

  if (normalized === 'blueprint') return 'grooming'
  if (normalized === 'confidence') return 'wellness'
  if (normalized === 'products' || normalized === 'occasion') return 'style'
  if (normalized === 'lifetime') return 'lifestyle'

  return normalized || 'general'
}

function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    general: 'General',
    wellness: 'Wellness',
    style: 'Style',
    grooming: 'Grooming',
    lifestyle: 'Lifestyle',
  }

  return categoryMap[category] || category
}

function sanitizeArticleHtml(content: string): string {
  return String(content || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, '')
    .replace(/<form[\s\S]*?>[\s\S]*?<\/form>/gi, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/\s(on\w+)=(".*?"|'.*?'|[^\s>]+)/gi, '')
    .replace(/\s(href|src)=("javascript:[^"]*"|'javascript:[^']*')/gi, '')
}

function isFullHtmlDocument(content: string): boolean {
  return /<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(String(content || ''))
}

function extractStyleTags(content: string): string[] {
  const matches = String(content || '').match(/<style[^>]*>[\s\S]*?<\/style>/gi)
  return matches ?? []
}

function extractBodyContent(content: string): string {
  const safe = String(content || '')
  const bodyMatch = safe.match(/<body[^>]*>([\s\S]*?)<\/body>/i)

  if (bodyMatch?.[1]) {
    return bodyMatch[1].trim()
  }

  return safe
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<\/?(html|head|meta|title|link|body)[^>]*>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .trim()
}

function scopeSelectorGroup(selectorGroup: string, scopeClass: string): string {
  return selectorGroup
    .split(',')
    .map((rawSelector) => rawSelector.trim())
    .filter(Boolean)
    .map((selector) => {
      if (selector.startsWith('@')) return selector
      if (selector.includes(scopeClass)) return selector

      if (
        selector === 'html' ||
        selector === 'body' ||
        selector === ':root' ||
        selector === 'html body'
      ) {
        return scopeClass
      }

      if (selector.startsWith('body ') || selector.startsWith('html ')) {
        return selector.replace(/^(body|html)\s+/, `${scopeClass} `)
      }

      return `${scopeClass} ${selector}`
    })
    .join(', ')
}

function scopeCssSelectors(css: string, scopeClass: string): string {
  const input = String(css || '').trim()
  if (!input) return ''

  let result = ''
  let i = 0

  while (i < input.length) {
    const mediaIndex = input.indexOf('@media', i)
    const supportsIndex = input.indexOf('@supports', i)

    let nextAtRuleIndex = -1
    if (mediaIndex !== -1 && supportsIndex !== -1) {
      nextAtRuleIndex = Math.min(mediaIndex, supportsIndex)
    } else {
      nextAtRuleIndex = mediaIndex !== -1 ? mediaIndex : supportsIndex
    }

    if (nextAtRuleIndex === -1) {
      result += input
        .slice(i)
        .replace(/([^{}]+)\{([^{}]*)\}/g, (_, selectorGroup, declarations) => {
          const scopedSelectors = scopeSelectorGroup(selectorGroup, scopeClass)
          return `${scopedSelectors}{${declarations}}`
        })
      break
    }

    const beforeAtRule = input.slice(i, nextAtRuleIndex)
    result += beforeAtRule.replace(
      /([^{}]+)\{([^{}]*)\}/g,
      (_, selectorGroup, declarations) => {
        const scopedSelectors = scopeSelectorGroup(selectorGroup, scopeClass)
        return `${scopedSelectors}{${declarations}}`
      }
    )

    const blockStart = input.indexOf('{', nextAtRuleIndex)
    if (blockStart === -1) {
      result += input.slice(nextAtRuleIndex)
      break
    }

    let depth = 1
    let j = blockStart + 1

    while (j < input.length && depth > 0) {
      if (input[j] === '{') depth += 1
      if (input[j] === '}') depth -= 1
      j += 1
    }

    const atRuleHeader = input.slice(nextAtRuleIndex, blockStart + 1)
    const atRuleBody = input.slice(blockStart + 1, j - 1)
    const scopedAtRuleBody = scopeCssSelectors(atRuleBody, scopeClass)

    result += `${atRuleHeader}${scopedAtRuleBody}}`
    i = j
  }

  return result
}

function extractScopedStyles(content: string, scopeClass: string): string {
  return extractStyleTags(content)
    .map((tag) => tag.replace(/<\/?style[^>]*>/gi, '').trim())
    .map((css) => scopeCssSelectors(css, scopeClass))
    .filter(Boolean)
    .join('\n')
}

function looksLikeDarkArticle(content: string): boolean {
  const value = String(content || '').toLowerCase()

  const signals = [
    '#080808',
    '#0b0b0b',
    '#111111',
    '#141414',
    '#151515',
    '#1b1b1b',
    'linear-gradient(180deg, #080808',
    'linear-gradient(180deg,#080808',
    'linear-gradient(180deg, #0b0b0b',
    'linear-gradient(180deg,#0b0b0b',
    'color:#f5f5f5',
    'color: #f5f5f5',
    'color:#fff',
    'color: #fff',
    '--bg:#0b0b0b',
    '--bg: #0b0b0b',
    '--panel:#141414',
    '--panel: #141414',
  ]

  let count = 0

  for (const signal of signals) {
    if (value.includes(signal)) count += 1
  }

  return count >= 2
}

function renderRichText(content: string) {
  const safe = String(content || '').trim()
  if (!safe) return null

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(safe)

  if (looksLikeHtml) {
    return (
      <div
        className="article-content max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(safe) }}
      />
    )
  }

  return safe.split('\n').map((line, idx) => {
    const text = line.trim()

    if (!text) {
      return <div key={idx} className="h-4" />
    }

    return (
      <p key={idx} className="font-serif text-[17px] leading-relaxed text-inherit">
        {text}
      </p>
    )
  })
}

const articleContentStyles = `
  .article-content {
    color: inherit;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1.0625rem;
    line-height: 1.85;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .article-content > *:first-child {
    margin-top: 0 !important;
  }

  .article-content > *:last-child {
    margin-bottom: 0 !important;
  }

  .article-content h1,
  .article-content h2,
  .article-content h3,
  .article-content h4,
  .article-content h5,
  .article-content h6 {
    color: inherit;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 600;
    line-height: 1.2;
    margin-top: 2.2rem;
    margin-bottom: 1rem;
  }

  .article-content h1 {
    font-size: clamp(2rem, 4vw, 3rem);
  }

  .article-content h2 {
    font-size: clamp(1.75rem, 3vw, 2.4rem);
  }

  .article-content h3 {
    font-size: clamp(1.4rem, 2.4vw, 1.9rem);
  }

  .article-content h4 {
    font-size: clamp(1.2rem, 2vw, 1.45rem);
  }

  .article-content h5 {
    font-size: 1.125rem;
  }

  .article-content h6 {
    font-size: 1rem;
    letter-spacing: 0.02em;
  }

  .article-content p,
  .article-content ul,
  .article-content ol,
  .article-content blockquote,
  .article-content table,
  .article-content figure {
    margin-top: 0;
    margin-bottom: 1.25rem;
  }

  .article-content ul,
  .article-content ol {
    padding-left: 1.5rem;
  }

  .article-content li {
    margin-bottom: 0.45rem;
  }

  .article-content a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 0.15em;
  }

  .article-content strong {
    font-weight: 700;
    color: inherit;
  }

  .article-content em {
    font-style: italic;
  }

  .article-content img {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: 0.75rem;
    margin: 1.5rem 0;
  }

  .article-content blockquote {
    border-left: 3px solid rgba(0, 0, 0, 0.18);
    padding-left: 1rem;
    font-style: italic;
    opacity: 0.9;
  }

  .article-content hr {
    border: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    margin: 2rem 0;
  }

  .article-content table {
    width: 100%;
    border-collapse: collapse;
  }

  .article-content th,
  .article-content td {
    border: 1px solid rgba(0, 0, 0, 0.12);
    padding: 0.75rem;
    text-align: left;
    vertical-align: top;
  }

  .article-content iframe,
  .article-content video {
    width: 100%;
    max-width: 100%;
    border-radius: 0.75rem;
    margin: 1.5rem 0;
  }

  .article-html-shell {
    width: 100%;
  }

  .article-html-render {
    width: 100%;
  }

  .article-html-render img,
  .article-html-render video,
  .article-html-render iframe {
    max-width: 100%;
    height: auto;
  }

  .article-html-render table {
    max-width: 100%;
  }

  .article-html-render > *:first-child {
    margin-top: 0 !important;
  }

  .article-html-render > *:last-child {
    margin-bottom: 0 !important;
  }

  .article-route-dark {
    background:
      radial-gradient(circle at top, rgba(214, 178, 110, 0.08), transparent 24%),
      linear-gradient(180deg, #080808 0%, #0b0b0b 100%);
    color: #f5f5f5;
  }

  .article-route-light {
    background: #f5f5f5;
    color: #111111;
  }

  .article-route-dark .article-route-link {
    color: rgba(255, 255, 255, 0.82);
  }

  .article-route-dark .article-route-link:hover {
    color: rgba(255, 255, 255, 1);
  }

  .article-route-light .article-route-link {
    color: rgba(17, 17, 17, 0.72);
  }

  .article-route-light .article-route-link:hover {
    color: rgba(17, 17, 17, 1);
  }

  .article-route-dark .article-route-meta {
    color: rgba(255, 255, 255, 0.9);
  }

  .article-route-light .article-route-meta {
    color: rgba(17, 17, 17, 0.92);
  }
`

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)

  const article: ArticleDocument | null = await getArticleBySlugCMS(normalizedSlug)

  if (!article) {
    notFound()
  }

  const title = article.title ?? 'Article'
  const heroImage = article.heroImage || '/images/Image-10.jpeg'

  const category = normalizeCategory(article.category)
  const categoryLabel = getCategoryName(category)

  const publishedLabel =
    formatDate(article.publishDate) ||
    formatDate(article.datePublished) ||
    formatDate(article.createdAt)

  const rawContent = String(article.content ?? '').trim()
  const cleanedHtml = sanitizeArticleHtml(rawContent)
  const fullHtmlMode = isFullHtmlDocument(rawContent)

  const customBody = fullHtmlMode ? extractBodyContent(cleanedHtml) : ''
  const scopedCustomStyles = fullHtmlMode
    ? extractScopedStyles(cleanedHtml, '.article-html-render')
    : ''

  const darkArticle = fullHtmlMode ? looksLikeDarkArticle(cleanedHtml) : false
  const routeSurfaceClass = darkArticle ? 'article-route-dark' : 'article-route-light'

  return (
    <ProtectedRoute>
      <StructuredData pageKey="article" />

      <style dangerouslySetInnerHTML={{ __html: articleContentStyles }} />
      {fullHtmlMode && scopedCustomStyles ? (
        <style dangerouslySetInnerHTML={{ __html: scopedCustomStyles }} />
      ) : null}

      <div className={`min-h-screen ${fullHtmlMode ? routeSurfaceClass : ''}`}>
        <section className="py-16">
          <PagePadding>
            <Container>
              <div className={fullHtmlMode ? 'mx-auto max-w-7xl' : 'mx-auto max-w-3xl'}>
                <div className="mb-8">
                  <Link
                    href="/articles"
                    className={`article-route-link text-sm font-serif transition-opacity hover:opacity-100 ${
                      fullHtmlMode ? '' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    ← Back to Articles
                  </Link>
                </div>

                <div
                  className={`${
                    fullHtmlMode
                      ? 'article-route-meta mx-auto max-w-3xl space-y-6 text-center'
                      : 'space-y-6 text-center'
                  }`}
                >
                  {categoryLabel ? (
                    <p className="font-sans text-xs uppercase tracking-[0.2em] opacity-70">
                      {categoryLabel}
                    </p>
                  ) : null}

                  <h1 className="font-sans text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
                    {title}
                  </h1>

                  {article.excerpt ? (
                    <p className="font-serif text-lg leading-relaxed opacity-80 md:text-xl">
                      {article.excerpt}
                    </p>
                  ) : null}

                  {publishedLabel ? (
                    <div className="font-serif text-sm opacity-70">
                      Published · {publishedLabel}
                    </div>
                  ) : null}
                </div>
              </div>
            </Container>
          </PagePadding>
        </section>

        <section className="pb-10">
          <PagePadding>
            <Container>
              <div className={fullHtmlMode ? 'mx-auto max-w-7xl' : 'mx-auto max-w-6xl'}>
                <div className="relative overflow-hidden rounded-lg">
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={heroImage}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 1400px"
                      priority
                    />
                  </div>
                </div>
              </div>
            </Container>
          </PagePadding>
        </section>

        <section className="py-10">
          {fullHtmlMode ? (
            <div className="article-html-shell w-full">
              <div
                className="article-html-render w-full"
                dangerouslySetInnerHTML={{ __html: customBody }}
              />
            </div>
          ) : (
            <PagePadding>
              <Container>
                <div className="mx-auto max-w-3xl space-y-5">
                  {article.content ? (
                    renderRichText(article.content)
                  ) : (
                    <p className="font-serif opacity-70">No content yet.</p>
                  )}
                </div>
              </Container>
            </PagePadding>
          )}
        </section>
      </div>
    </ProtectedRoute>
  )
}