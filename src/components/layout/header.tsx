'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

import { NAVIGATION_LINKS, SOCIAL_LINKS } from '@/lib/constants'
import { PagePadding, Container } from '@/components/layout'
import { useAuth } from '@/lib/firebase/auth'
import { Button } from '@/components/ui'
import { getContentCategories } from '@/lib/firebase/contentCategories'

import type { ProductCategory } from '@/lib/products/types'

type CategoryWithOptionalActive = ProductCategory & {
  active?: boolean
}

type HeaderTone = 'light' | 'dark'

function ensureGeneralCategory(
  categories: ProductCategory[]
): ProductCategory[] {
  const hasGeneral = categories.some(
    (item) =>
      String(item.slug || '').trim().toLowerCase() === 'general' ||
      String(item.name || '').trim().toLowerCase() === 'general'
  )

  if (hasGeneral) return categories

  return [
    {
      id: 'general',
      name: 'General',
      slug: 'general',
      section: 'articles',
    },
    ...categories,
  ]
}

function getActiveArticleCategories(
  categories: ProductCategory[]
): ProductCategory[] {
  const filtered = categories.filter((item) => {
    const category = item as CategoryWithOptionalActive
    return category.active !== false
  })

  return ensureGeneralCategory(filtered)
}

function parseColorToRgb(
  color: string
): {
  r: number
  g: number
  b: number
  a: number
} | null {
  const value = String(color || '').trim().toLowerCase()

  if (!value) return null

  if (value === 'transparent') {
    return {
      r: 255,
      g: 255,
      b: 255,
      a: 0,
    }
  }

  const rgbMatch = value.match(
    /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/
  )

  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
      a: rgbMatch[4] === undefined ? 1 : Number(rgbMatch[4]),
    }
  }

  const hexMatch = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)

  if (!hexMatch) return null

  const hex = hexMatch[1]

  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
      a: 1,
    }
  }

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
    a: 1,
  }
}

function getRelativeLuminance(
  r: number,
  g: number,
  b: number
): number {
  const normalize = (channel: number) => {
    const value = channel / 255

    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4)
  }

  const red = normalize(r)
  const green = normalize(g)
  const blue = normalize(b)

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function findEffectiveBackgroundColor(
  element: Element | null
): string | null {
  let current: Element | null = element

  while (current && current instanceof HTMLElement) {
    const styles = window.getComputedStyle(current)
    const backgroundColor = styles.backgroundColor
    const parsed = parseColorToRgb(backgroundColor)

    if (parsed && parsed.a > 0) {
      return backgroundColor
    }

    current = current.parentElement
  }

  const bodyColor = window.getComputedStyle(document.body).backgroundColor
  const htmlColor = window.getComputedStyle(
    document.documentElement
  ).backgroundColor

  if (parseColorToRgb(bodyColor)?.a) return bodyColor
  if (parseColorToRgb(htmlColor)?.a) return htmlColor

  return 'rgb(255, 255, 255)'
}

function getToneFromColor(color: string | null): HeaderTone {
  const parsed = parseColorToRgb(color || '')

  if (!parsed) return 'dark'

  const luminance = getRelativeLuminance(
    parsed.r,
    parsed.g,
    parsed.b
  )

  return luminance > 0.45 ? 'dark' : 'light'
}

export function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement | null>(null)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isArticlesMenuOpen, setIsArticlesMenuOpen] = useState(false)
  const [articleCategories, setArticleCategories] = useState<
    ProductCategory[]
  >([])
  const [headerTone, setHeaderTone] = useState<HeaderTone>('light')

  const isArticlePage = pathname?.startsWith('/articles/') ?? false

  useEffect(() => {
    async function loadArticleCategories() {
      try {
        const categories = await getContentCategories('articles')

        setArticleCategories(
          getActiveArticleCategories(categories)
        )
      } catch (error) {
        console.error(
          'Failed to load article navbar categories:',
          error
        )

        setArticleCategories(
          getActiveArticleCategories([])
        )
      }
    }

    void loadArticleCategories()
  }, [])

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [isMobileMenuOpen])

  const articleNavCategories = useMemo(() => {
    return articleCategories.map((item) => ({
      id: item.id,
      name: item.name,
      href: `/articles/category/${item.slug}`,
    }))
  }, [articleCategories])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((current) => !current)

    if (isMobileMenuOpen) {
      setIsArticlesMenuOpen(false)
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setIsArticlesMenuOpen(false)
  }

  const toggleArticlesMenu = () => {
    setIsArticlesMenuOpen((current) => !current)
  }

  const updateHeaderTone = useCallback(() => {
    if (!isArticlePage) {
      setHeaderTone('light')
      return
    }

    const header = headerRef.current

    if (!header) return

    const rect = header.getBoundingClientRect()
    const sampleY = Math.max(
      rect.bottom - 8,
      rect.top + rect.height / 2
    )

    const sampleXs = [
      rect.left + rect.width * 0.2,
      rect.left + rect.width * 0.5,
      rect.left + rect.width * 0.8,
    ]

    let resolvedTone: HeaderTone = 'dark'

    for (const sampleX of sampleXs) {
      const elements = document.elementsFromPoint(
        sampleX,
        sampleY
      )

      const target = elements.find(
        (element) => !header.contains(element)
      )

      const backgroundColor = findEffectiveBackgroundColor(
        target ?? document.body
      )

      const tone = getToneFromColor(backgroundColor)
      resolvedTone = tone

      if (tone === 'light') {
        break
      }
    }

    setHeaderTone((current) =>
      current === resolvedTone ? current : resolvedTone
    )
  }, [isArticlePage])

  useEffect(() => {
    updateHeaderTone()

    if (!isArticlePage) return

    let frame = 0
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateHeaderTone)
    }

    const observer = new MutationObserver(() => {
      scheduleUpdate()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style'],
    })

    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('scroll', scheduleUpdate, {
      passive: true,
    })

    timeoutId = setTimeout(scheduleUpdate, 150)

    const secondTimeoutId = setTimeout(
      scheduleUpdate,
      600
    )

    return () => {
      observer.disconnect()

      window.removeEventListener(
        'resize',
        scheduleUpdate
      )

      window.removeEventListener(
        'scroll',
        scheduleUpdate
      )

      cancelAnimationFrame(frame)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      clearTimeout(secondTimeoutId)
    }
  }, [isArticlePage, updateHeaderTone])

  useEffect(() => {
    if (!isArticlePage) {
      document.documentElement.style.removeProperty(
        '--header-fg'
      )

      document.documentElement.style.removeProperty(
        '--header-divider'
      )

      return
    }

    const foreground =
      headerTone === 'light'
        ? '#f8f1e5'
        : '#f8f1e5'

    const divider =
      headerTone === 'light'
        ? 'rgba(248,241,229,0.42)'
        : 'rgba(248,241,229,0.42)'

    document.documentElement.style.setProperty(
      '--header-fg',
      foreground
    )

    document.documentElement.style.setProperty(
      '--header-divider',
      divider
    )

    return () => {
      document.documentElement.style.removeProperty(
        '--header-fg'
      )

      document.documentElement.style.removeProperty(
        '--header-divider'
      )
    }
  }, [headerTone, isArticlePage])

  const headerTextColorClass =
    'text-[var(--color-eg-cream)]'

  const subtleTextColorClass =
    'text-[rgba(248,241,229,0.82)]'

  const logoFilterClass =
    'brightness-0 invert'

  const dividerClass =
    'bg-[rgba(248,241,229,0.42)]'

  const menuLineClass =
    'bg-[var(--color-eg-cream)]'

  const logoutButtonClass =
    'border-[var(--color-eg-cream)] bg-transparent text-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]'

  return (
    <header
      ref={headerRef}
      className={
        isArticlePage
          ? 'sticky top-0 z-[1000] isolate border-b border-[rgba(248,241,229,0.24)] bg-[rgba(47,45,36,0.86)] text-[var(--color-eg-cream)] shadow-[0_14px_42px_rgba(24,23,17,0.34)]'
          : 'sticky top-0 z-[1000] border-b border-[rgba(248,241,229,0.18)] bg-[rgba(95,91,77,0.97)] text-[var(--color-eg-cream)] shadow-[0_8px_24px_rgba(41,40,32,0.12)] md:backdrop-blur-md'
      }
      style={
        isArticlePage && !isMobileMenuOpen
          ? {
              WebkitBackdropFilter: 'blur(32px) saturate(115%)',
              backdropFilter: 'blur(32px) saturate(115%)',
            }
          : undefined
      }
    >
      <div
        className={
          isArticlePage
            ? 'relative z-[1000] bg-transparent'
            : 'relative z-[1000] bg-[rgba(95,91,77,0.97)]'
        }
      >
        <PagePadding>
          <Container>
            <nav className="relative z-20 flex items-center justify-between pb-5 pt-5 md:pb-6 md:pt-6">
              <div className="flex min-w-0 items-center">
                <Link
                  href="/home"
                  className="inline-block min-w-0"
                >
                  <Image
                    src="/images/The Elevated gentleman.svg"
                    alt="The Elevated Gentleman"
                    width={330}
                    height={19}
                    priority
                    loading="eager"
                    className={`h-auto w-[205px] max-w-[calc(100vw-9.5rem)] md:hidden ${logoFilterClass}`}
                  />

                  <Image
                    src="/EG.svg"
                    alt="The Elevated Gentleman"
                    width={50}
                    height={50}
                    priority
                    loading="eager"
                    className={`hidden h-8 w-auto md:block lg:hidden ${logoFilterClass}`}
                  />

                  <Image
                    src="/images/The Elevated gentleman.svg"
                    alt="The Elevated Gentleman"
                    width={330}
                    height={19}
                    priority
                    loading="eager"
                    className={`hidden h-5 w-auto lg:block ${logoFilterClass}`}
                  />
                </Link>
              </div>

              <div className="hidden items-center justify-end md:flex">
                <div className="flex items-center gap-2 pl-2 md:gap-3 md:pl-3 lg:gap-6 lg:pl-6">
                  {user ? (
                    <>
                      <div className="z-10 flex items-center justify-center gap-2 md:gap-3 lg:gap-6">
                        {NAVIGATION_LINKS.map((link) => {
                          if (link.href === '/articles') {
                            return (
                              <div
                                key={link.href}
                                className="group relative flex items-center"
                              >
                                <Link
                                  href={link.href}
                                  className={`group relative inline-block h-7 cursor-pointer overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out hover:opacity-70 ${headerTextColorClass}`}
                                >
                                  <div className="block font-serif text-sm md:text-base lg:text-xl">
                                    {link.name}
                                  </div>

                                  <div className="block font-serif text-sm md:text-base lg:text-xl">
                                    {link.name}
                                  </div>
                                </Link>

                                <div className="absolute left-1/2 top-full z-[1200] hidden -translate-x-1/2 pt-4 group-hover:block">
                                  <div className="min-w-[240px] border border-[rgba(248,241,229,0.18)] bg-[rgba(47,45,36,0.96)] p-2 text-[var(--color-eg-cream)] shadow-[0_18px_50px_rgba(24,23,17,0.36)] backdrop-blur-xl">
                                    <Link
                                      href="/articles"
                                      className="block px-4 py-3 font-serif text-sm transition-colors hover:bg-[rgba(248,241,229,0.10)]"
                                    >
                                      All Articles
                                    </Link>

                                    {articleNavCategories.map(
                                      (item) => (
                                        <Link
                                          key={item.id}
                                          href={item.href}
                                          className="block px-4 py-3 font-serif text-sm transition-colors hover:bg-[rgba(248,241,229,0.10)]"
                                        >
                                          {item.name}
                                        </Link>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          }

                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={`group relative h-7 cursor-pointer overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out hover:opacity-70 ${headerTextColorClass}`}
                            >
                              <div className="block font-serif text-sm md:text-base lg:text-xl">
                                {link.name}
                              </div>

                              <div className="block font-serif text-sm md:text-base lg:text-xl">
                                {link.name}
                              </div>
                            </Link>
                          )
                        })}
                      </div>

                      <div
                        className={`h-px w-[8px] md:w-[10px] lg:w-[15px] ${dividerClass}`}
                      />
                    </>
                  ) : null}

                  <div className="z-10 flex items-center justify-center gap-4">
                    {SOCIAL_LINKS.map((social) => (
                      <div
                        key={social.name}
                        className={`h-5 w-5 ${headerTextColorClass}`}
                      >
                        <Link
                          href={social.href}
                          target="_blank"
                          className="inline-block cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 hover:opacity-70"
                        >
                          <div className="flex h-5 w-5">
                            {social.icon === 'Instagram' ? (
                              <svg
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                              >
                                <path
                                  fill="none"
                                  d="M0 0h24v24H0z"
                                />

                                <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 0 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4c-2.474 0-2.878.007-4.029.058-.784.037-1.31.142-1.798.332-.434.168-.747.369-1.08.703a2.89 2.89 0 0 0-.704 1.08c-.19.49-.295 1.015-.331 1.798C4.006 9.075 4 9.461 4 12c0 2.474.007 2.878.058 4.029.037.783.142 1.31.331 1.797.17.435.37.748.702 1.08.337.336.65.537 1.08.703.494.191 1.02.297 1.8.333C9.075 19.994 9.461 20 12 20c2.474 0 2.878-.007 4.029-.058.782-.037 1.309-.142 1.797-.331.433-.169.748-.37 1.08-.702.337-.337.538-.65.704-1.08.19-.493.296-1.02.332-1.8.052-1.104.058-1.49.058-4.029 0-2.474-.007-2.878-.058-4.029-.037-.782-.142-1.31-.332-1.798a2.911 2.911 0 0 0-.703-1.08 2.884 2.884 0 0 0-1.08-.704c-.49-.19-1.016-.295-1.798-.331C14.925 4.006 14.539 4 12 4zm0-2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772A4.915 4.915 0 0 1 18.55 21.475c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717-.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z" />
                              </svg>
                            ) : null}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {user ? (
                    <div className="ml-2 flex items-center gap-1 md:ml-3 md:gap-2 lg:ml-6 lg:gap-4">
                      <span
                        className={`hidden max-w-none truncate font-serif text-sm lg:block ${subtleTextColorClass}`}
                      >
                        {user.displayName || user.email}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className={`whitespace-nowrap px-2 text-[10px] md:px-3 md:text-xs lg:text-sm ${logoutButtonClass}`}
                      >
                        Logout
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4 md:hidden">
                <div className="flex items-center gap-3">
                  {SOCIAL_LINKS.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      className={`h-4 w-4 cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 hover:opacity-70 ${headerTextColorClass}`}
                    >
                      {social.icon === 'Instagram' ? (
                        <svg
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                        >
                          <path
                            fill="none"
                            d="M0 0h24v24H0z"
                          />

                          <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 0 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4c-2.474 0-2.878.007-4.029.058-.784.037-1.31.142-1.798.332-.434.168-.747.369-1.08.703a2.89 2.89 0 0 0-.704 1.08c-.19.49-.295 1.015-.331 1.798C4.006 9.075 4 9.461 4 12c0 2.474.007 2.878.058 4.029.037.783.142 1.31.331 1.797.17.435.37.748.702 1.08.337.336.65.537 1.08.703.494.191 1.02.297 1.8.333C9.075 19.994 9.461 20 12 20c2.474 0 2.878-.007 4.029-.058.782-.037 1.309-.142 1.797-.331.433-.169.748-.37 1.08-.702.337-.337.538-.65.704-1.08.19-.493.296-1.02.332-1.8.052-1.104.058-1.49.058-4.029 0-2.474-.007-2.878-.058-4.029-.037-.782-.142-1.31-.332-1.798a2.911 2.911 0 0 0-.703-1.08 2.884 2.884 0 0 0-1.08-.704c-.49-.19-1.016-.295-1.798-.331C14.925 4.006 14.539 4 12 4zm0-2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772A4.915 4.915 0 0 1 18.55 21.475c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717-.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z" />
                        </svg>
                      ) : null}
                    </Link>
                  ))}
                </div>

                {user ? (
                  <button
                    type="button"
                    onClick={toggleMobileMenu}
                    className="group relative flex h-10 w-10 cursor-pointer touch-manipulation flex-col items-center justify-center transition-all duration-300 ease-in-out"
                    aria-label="Toggle mobile menu"
                    aria-expanded={isMobileMenuOpen}
                  >
                    <div className="relative flex h-5 w-6 flex-col justify-between">
                      <span
                        className={`h-0.5 w-full transition-all duration-300 ease-in-out ${
                          isMobileMenuOpen
                            ? 'translate-y-2 rotate-45'
                            : 'group-hover:w-5'
                        } ${menuLineClass}`}
                      />

                      <span
                        className={`h-0.5 w-full transition-all duration-300 ease-in-out ${
                          isMobileMenuOpen
                            ? 'opacity-0'
                            : 'group-hover:w-4'
                        } ${menuLineClass}`}
                      />

                      <span
                        className={`h-0.5 w-full transition-all duration-300 ease-in-out ${
                          isMobileMenuOpen
                            ? '-translate-y-2 -rotate-45'
                            : 'group-hover:w-5'
                        } ${menuLineClass}`}
                      />
                    </div>
                  </button>
                ) : null}
              </div>
            </nav>

            <div className={`${dividerClass} h-px w-full`} />
          </Container>
        </PagePadding>
      </div>

      <div
        className={`fixed inset-0 z-[1100] h-[100dvh] overflow-hidden bg-transparent transition-all duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen
            ? 'visible opacity-100'
            : 'invisible opacity-0'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'opacity-50'
              : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
        />

        <div
          className={`absolute right-0 top-0 h-[100dvh] w-[75vw] max-w-80 overflow-hidden bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] shadow-2xl transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'translate-x-0'
              : 'translate-x-full'
          }`}
        >
          {user ? (
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[rgba(248,241,229,0.22)] px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-eg-cream)]">
                    <span className="text-sm font-semibold text-[var(--color-eg-espresso-deep)]">
                      {(user.displayName || user.email || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-sans text-sm font-semibold text-[var(--color-eg-cream)]">
                      {user.displayName || 'Welcome'}
                    </div>

                    <div className="truncate font-serif text-xs text-[rgba(248,241,229,0.78)]">
                      {user.email}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-[var(--color-eg-cream)] transition-colors hover:bg-[rgba(248,241,229,0.12)]"
                  aria-label="Close mobile menu"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-6">
                {NAVIGATION_LINKS.map((link, index) => {
                  if (link.href === '/articles') {
                    return (
                      <div
                        key={link.href}
                        className="rounded-lg"
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        <button
                          type="button"
                          onClick={toggleArticlesMenu}
                          className="group flex w-full cursor-pointer touch-manipulation items-center justify-between rounded-lg p-4 text-left transition-all duration-200 ease-in-out hover:bg-[rgba(248,241,229,0.10)]"
                        >
                          <span className="font-serif text-lg text-[var(--color-eg-cream)]">
                            {link.name}
                          </span>

                          <svg
                            className={`h-4 w-4 text-[rgba(248,241,229,0.70)] transition-all duration-200 ${
                              isArticlesMenuOpen
                                ? 'rotate-90 text-[var(--color-eg-cream)]'
                                : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isArticlesMenuOpen
                              ? 'max-h-96 opacity-100'
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="pb-2 pl-4">
                            <Link
                              href="/articles"
                              onClick={closeMobileMenu}
                              className="block rounded-lg p-3 font-serif text-base text-[rgba(248,241,229,0.86)] transition-colors hover:bg-[rgba(248,241,229,0.10)] hover:text-[var(--color-eg-cream)]"
                            >
                              All Articles
                            </Link>

                            {articleNavCategories.map(
                              (item) => (
                                <Link
                                  key={item.id}
                                  href={item.href}
                                  onClick={closeMobileMenu}
                                  className="block rounded-lg p-3 font-serif text-base text-[rgba(248,241,229,0.86)] transition-colors hover:bg-[rgba(248,241,229,0.10)] hover:text-[var(--color-eg-cream)]"
                                >
                                  {item.name}
                                </Link>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="group block cursor-pointer rounded-lg p-4 transition-all duration-200 ease-in-out hover:bg-[rgba(248,241,229,0.10)]"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg text-[var(--color-eg-cream)]">
                          {link.name}
                        </span>

                        <svg
                          className="h-4 w-4 text-[rgba(248,241,229,0.70)] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-eg-cream)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  )
                })}
              </nav>

              <div className="shrink-0 space-y-4 border-t border-[rgba(248,241,229,0.22)] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
                <div className="flex items-center justify-center gap-4">
                  {SOCIAL_LINKS.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(248,241,229,0.34)] text-[var(--color-eg-cream)] transition-all duration-200 hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]"
                    >
                      {social.icon === 'Instagram' ? (
                        <svg
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                        >
                          <path
                            fill="none"
                            d="M0 0h24v24H0z"
                          />

                          <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 0 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4c-2.474 0-2.878.007-4.029.058-.784.037-1.31.142-1.798.332-.434.168-.747.369-1.08.703a2.89 2.89 0 0 0-.704 1.08c-.19.49-.295 1.015-.331 1.798C4.006 9.075 4 9.461 4 12c0 2.474.007 2.878.058 4.029.037.783.142 1.31.331 1.797.17.435.37.748.702 1.08.337.336.65.537 1.08.703.494.191 1.02.297 1.8.333C9.075 19.994 9.461 20 12 20c2.474 0 2.878-.007 4.029-.058.782-.037 1.309-.142 1.797-.331.433-.169.748-.37 1.08-.702.337-.337.538-.65.704-1.08.19-.493.296-1.02.332-1.8.052-1.104.058-1.49.058-4.029 0-2.474-.007-2.878-.058-4.029-.037-.782-.142-1.31-.332-1.798a2.911 2.911 0 0 0-.703-1.08 2.884 2.884 0 0 0-1.08-.704c-.49-.19-1.016-.295-1.798-.331C14.925 4.006 14.539 4 12 4zm0-2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772A4.915 4.915 0 0 1 18.55 21.475c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717-.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z" />
                        </svg>
                      ) : null}
                    </Link>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full border-[var(--color-eg-cream)] bg-transparent text-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="navbar-sticky-placeholder" />
      <div className="mobile-menu-overlay" />
    </header>
  )
}

export default Header