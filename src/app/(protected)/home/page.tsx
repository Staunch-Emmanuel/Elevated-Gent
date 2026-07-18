'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Container, PagePadding } from '@/components/layout'
import { Button } from '@/components/ui'
import { StructuredData } from '@/components/seo/StructuredData'
import { useAuth } from '@/lib/firebase/auth'

import {
  defaultHomepageContent,
  getHomepageContent,
  type HomepageContent,
  type HomepageFeatureSection,
} from '@/lib/firebase/homepage'

function replaceFirstName(template: string, firstName: string) {
  return template.replaceAll('{firstName}', firstName || 'there')
}

function buildLogoTrack(items: string[]) {
  const valid = items.filter(Boolean)

  if (!valid.length) return []

  const minRepeats = 4
  const repeated: string[] = []

  for (let index = 0; index < minRepeats; index += 1) {
    repeated.push(...valid)
  }

  return repeated
}

function normalizeHomepageHref(
  href: string | undefined,
  fallback: string
) {
  const raw = String(href || '').trim()

  if (!raw) return fallback

  if (raw === '/weekly-finds') {
    return '/weekly'
  }

  if (raw.startsWith('/weekly-finds?')) {
    return raw.replace('/weekly-finds', '/weekly')
  }

  return raw
}

function FeatureCard({
  section,
  align = 'left',
  fallbackHref,
}: {
  section: HomepageFeatureSection
  align?: 'left' | 'right'
  fallbackHref: string
}) {
  const href = normalizeHomepageHref(
    section.href,
    fallbackHref
  )

  return (
    <Link
      href={href}
      className="group block h-full border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-3 text-[var(--color-eg-ink)] shadow-[0_18px_45px_rgba(36,35,29,0.09)] transition-transform duration-300 hover:-translate-y-1 sm:p-4"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-eg-paper-soft)]">
        {section.imageUrl ? (
          <Image
            src={section.imageUrl}
            alt={section.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,_var(--color-eg-cream)_0%,_var(--color-eg-paper-soft)_100%)]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(36,35,29,0.02)_0%,rgba(36,35,29,0.72)_100%)]" />

        <div
          className={`absolute inset-x-0 bottom-0 p-5 text-[var(--color-eg-cream)] sm:p-6 md:p-8 ${
            align === 'right'
              ? 'text-right'
              : 'text-left'
          }`}
        >
          {section.eyebrow ? (
            <p className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-[rgba(232,235,236,0.88)] sm:text-[11px]">
              {section.eyebrow}
            </p>
          ) : null}

          <h3 className="eg-editorial-heading text-4xl text-[var(--color-eg-cream)] md:text-5xl">
            {section.title}
          </h3>
        </div>
      </div>

      <div className="space-y-5 px-2 py-6 md:px-3 md:py-7">
        <p className="font-serif text-base leading-7 text-[var(--color-eg-muted)] md:text-lg md:leading-8">
          {section.description}
        </p>

        <span className="inline-flex items-center border-b border-[var(--color-eg-espresso-deep)] pb-1 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-eg-espresso-deep)]">
          {section.ctaLabel || 'Explore'}
        </span>
      </div>
    </Link>
  )
}

function buildRollingHeroImages(
  images: string[]
): string[] {
  const valid = images.filter(Boolean)

  if (valid.length === 0) {
    return ['', '', '', '', '']
  }

  if (valid.length === 1) {
    return [
      valid[0],
      valid[0],
      valid[0],
      valid[0],
      valid[0],
      valid[0],
    ]
  }

  if (valid.length === 2) {
    return [
      valid[0],
      valid[1],
      valid[0],
      valid[1],
      valid[0],
      valid[1],
    ]
  }

  return [...valid, ...valid]
}

export default function HomePage() {
  const { user } = useAuth()

  const [content, setContent] =
    useState<HomepageContent>(
      defaultHomepageContent
    )

  const [loading, setLoading] = useState(true)

  const [activeHeroIndex, setActiveHeroIndex] =
    useState(0)

  const [
    heroTransitionEnabled,
    setHeroTransitionEnabled,
  ] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getHomepageContent()
        setContent(data)
      } catch (error) {
        console.error(
          'Failed to load homepage content:',
          error
        )

        setContent(defaultHomepageContent)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const heroImages = useMemo(() => {
    return buildRollingHeroImages(
      content.slideshowImages
    )
  }, [content.slideshowImages])

  const baseHeroImageCount = Math.max(
    content.slideshowImages.filter(Boolean).length,
    0
  )

  const totalHeroSteps = Math.max(
    baseHeroImageCount,
    1
  )

  useEffect(() => {
    if (baseHeroImageCount <= 1) return

    const interval = window.setInterval(() => {
      setActiveHeroIndex(
        (current) => current + 1
      )
    }, 2800)

    return () => {
      window.clearInterval(interval)
    }
  }, [baseHeroImageCount])

  useEffect(() => {
    if (baseHeroImageCount <= 1) return

    if (activeHeroIndex === totalHeroSteps) {
      const resetTimer = window.setTimeout(() => {
        setHeroTransitionEnabled(false)
        setActiveHeroIndex(0)

        window.setTimeout(() => {
          setHeroTransitionEnabled(true)
        }, 50)
      }, 1400)

      return () => {
        window.clearTimeout(resetTimer)
      }
    }
  }, [
    activeHeroIndex,
    totalHeroSteps,
    baseHeroImageCount,
  ])

  const firstName = useMemo(() => {
    return (
      user?.displayName?.split(' ')[0] ||
      'there'
    )
  }, [user])

  const welcomeTitle = useMemo(() => {
    return replaceFirstName(
      content.welcomeTitle,
      firstName
    )
  }, [content.welcomeTitle, firstName])

  const heroPrimaryHref =
    normalizeHomepageHref(
      content.primaryButton.href,
      '/outfit-inspiration#categories'
    )

  const heroSecondaryHref =
    normalizeHomepageHref(
      content.secondaryButton.href,
      '/weekly'
    )

  const storyPrimaryHref =
    normalizeHomepageHref(
      content.storySection.primaryButton.href,
      '/weekly?category=closet-staples'
    )

  const storySecondaryHref =
    normalizeHomepageHref(
      content.storySection.secondaryButton.href,
      '/personal-styling'
    )

  const weeklyFeatureHref =
    normalizeHomepageHref(
      content.weeklyFeature.href,
      '/weekly'
    )

  const outfitsFeatureHref =
    normalizeHomepageHref(
      content.outfitsFeature.href,
      '/outfit-inspiration#categories'
    )

  const articlesFeatureHref =
    normalizeHomepageHref(
      content.articlesFeature.href,
      '/articles'
    )

  const logoTrack = buildLogoTrack(
    content.partnerLogos
  )

  const storyImage =
    content.storySection.imageUrl ||
    content.weeklyFeature.imageUrl ||
    content.outfitsFeature.imageUrl ||
    ''

  return (
    <ProtectedRoute>
      <StructuredData pageKey="home" />

      <div className="min-h-screen bg-[var(--color-eg-espresso)] text-[var(--color-eg-cream)]">
        <section className="relative overflow-hidden border-b border-[var(--color-eg-line-light)] bg-[var(--color-eg-espresso-deep)]">
          <div className="absolute inset-0">
            <div
              className={`flex h-full ease-in-out ${
                heroTransitionEnabled
                  ? 'transition-transform duration-[1400ms]'
                  : ''
              }`}
              style={{
                transform: `translateX(-${
                  activeHeroIndex * 33.3333
                }%)`,
              }}
            >
              {heroImages.map(
                (imageUrl, index) => (
                  <div
                    key={`${
                      imageUrl || 'fallback'
                    }-${index}`}
                    className="relative h-full w-1/3 shrink-0 overflow-hidden bg-[var(--color-eg-espresso-soft)]"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={`Homepage hero image ${
                          index + 1
                        }`}
                        fill
                        priority={index < 3}
                        className="object-cover"
                        sizes="33vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(135deg,_var(--color-eg-espresso)_0%,_var(--color-eg-espresso-deep)_100%)]" />
                    )}
                  </div>
                )
              )}
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,23,17,0.46)_0%,rgba(24,23,17,0.34)_38%,rgba(24,23,17,0.80)_100%)]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,23,17,0.02)_0%,rgba(24,23,17,0.46)_84%)]" />
          </div>

          <PagePadding>
            <Container className="relative z-10">
              <div className="flex min-h-[82vh] items-center justify-center py-20 md:min-h-[92vh] md:py-24">
                <div className="max-w-5xl text-center text-[var(--color-eg-cream)]">
                  <div className="space-y-5 md:space-y-6">
                    <p className="font-sans text-[11px] font-medium uppercase tracking-[0.36em] text-[var(--color-text-muted)]">
                      {loading
                        ? 'Loading homepage...'
                        : 'The Elevated Gentleman'}
                    </p>

                    <h1 className="eg-editorial-heading text-[3.8rem] text-[var(--color-eg-cream)] sm:text-7xl md:text-8xl lg:text-[7.2rem]">
                      {welcomeTitle}
                    </h1>

                    <h2 className="mx-auto max-w-3xl font-sans text-xl font-medium leading-tight text-[var(--color-eg-cream)] sm:text-2xl md:text-3xl lg:text-[2.2rem]">
                      {content.heroSubtitle}
                    </h2>

                    <p className="mx-auto max-w-2xl font-serif text-base leading-8 text-[var(--color-text-muted)] sm:text-lg md:text-[1.2rem] md:leading-9">
                      {content.heroDescription}
                    </p>
                  </div>

                  <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      asChild
                      size="lg"
                      variant="inverse"
                      className="border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] px-7 text-[var(--color-eg-espresso-deep)] shadow-[0_14px_38px_rgba(24,23,17,0.24)] hover:bg-transparent hover:text-[var(--color-eg-cream)]"
                    >
                      <Link href={heroPrimaryHref}>
                        {content.primaryButton.label}
                      </Link>
                    </Button>

                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-[rgba(232,235,236,0.72)] bg-[rgba(24,23,17,0.12)] px-7 text-[var(--color-eg-cream)] hover:border-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]"
                    >
                      <Link href={heroSecondaryHref}>
                        {content.secondaryButton.label}
                      </Link>
                    </Button>
                  </div>

                  {totalHeroSteps > 1 ? (
                    <div className="mt-9 flex items-center justify-center gap-2">
                      {Array.from({
                        length: totalHeroSteps,
                      }).map((_, index) => (
                        <button
                          key={`hero-dot-${index}`}
                          type="button"
                          onClick={() => {
                            setHeroTransitionEnabled(true)
                            setActiveHeroIndex(index)
                          }}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index ===
                            activeHeroIndex %
                              totalHeroSteps
                              ? 'w-9 bg-[var(--color-eg-cream)]'
                              : 'w-2 bg-[rgba(232,235,236,0.42)] hover:bg-[rgba(232,235,236,0.76)]'
                          }`}
                          aria-label={`Show hero position ${
                            index + 1
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </Container>
          </PagePadding>
        </section>

        <section className="flex min-h-screen items-center justify-center border-b border-[var(--color-eg-line-light)] bg-[var(--color-eg-espresso-soft)] py-20 md:py-24 lg:py-28">
          <PagePadding>
            <Container>
              <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
                <div className="mx-auto max-w-xl space-y-8 lg:mx-0">
                  <div className="space-y-6">
                    <p className="font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--color-text-secondary)]">
                      {content.storySection.eyebrow}
                    </p>

                    <h2 className="eg-editorial-heading max-w-3xl text-5xl text-[var(--color-eg-cream)] md:text-7xl">
                      {content.storySection.title}
                    </h2>

                    <p className="max-w-2xl font-serif text-lg leading-8 text-[var(--color-text-muted)] md:text-[1.18rem] md:leading-9">
                      {content.storySection.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      asChild
                      size="lg"
                      className="border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] px-7 text-[var(--color-eg-espresso-deep)] hover:bg-transparent hover:text-[var(--color-eg-cream)]"
                    >
                      <Link href={storyPrimaryHref}>
                        {
                          content.storySection
                            .primaryButton.label
                        }
                      </Link>
                    </Button>

                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-[rgba(232,235,236,0.68)] bg-transparent px-7 text-[var(--color-eg-cream)] hover:border-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]"
                    >
                      <Link href={storySecondaryHref}>
                        {
                          content.storySection
                            .secondaryButton.label
                        }
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="relative min-h-[420px] overflow-hidden border border-[rgba(232,235,236,0.34)] bg-[var(--color-eg-cream)] p-3 shadow-[0_24px_60px_rgba(24,23,17,0.20)] sm:p-4 md:min-h-[620px]">
                  <div className="relative h-full min-h-[394px] overflow-hidden md:min-h-[588px]">
                    {storyImage ? (
                      <Image
                        src={storyImage}
                        alt={content.storySection.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 45vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(135deg,_var(--color-eg-cream)_0%,_var(--color-eg-paper-soft)_100%)]" />
                    )}

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,23,17,0.01)_0%,rgba(24,23,17,0.18)_100%)]" />
                  </div>
                </div>
              </div>
            </Container>
          </PagePadding>
        </section>

        {logoTrack.length > 0 ? (
          <section className="border-b border-[var(--color-eg-line-light)] bg-[var(--color-eg-espresso-deep)] py-6">
            <div className="overflow-hidden">
              <div className="homepage-logo-marquee flex w-max items-center gap-16 px-8 md:gap-20">
                {logoTrack.map(
                  (logoUrl, index) => (
                    <div
                      key={`${logoUrl}-${index}`}
                      className="relative h-9 w-28 shrink-0 opacity-75 grayscale brightness-0 invert transition-opacity duration-200 hover:opacity-100 md:h-10 md:w-32"
                    >
                      <Image
                        src={logoUrl}
                        alt={`Partner logo ${
                          index + 1
                        }`}
                        fill
                        className="object-contain"
                        sizes="128px"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        ) : null}

        <section className="bg-[var(--color-eg-espresso)] py-20 md:py-24 lg:py-28">
          <PagePadding>
            <Container>
              <div className="mb-12 max-w-2xl space-y-4 md:mb-14">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--color-text-secondary)]">
                  {content.exploreEyebrow}
                </p>

                <h2 className="eg-editorial-heading text-5xl text-[var(--color-eg-cream)] md:text-6xl">
                  {content.exploreTitle}
                </h2>
              </div>

              <div className="grid gap-7 lg:grid-cols-3 lg:gap-8">
                <FeatureCard
                  section={content.weeklyFeature}
                  fallbackHref={weeklyFeatureHref}
                />

                <FeatureCard
                  section={content.outfitsFeature}
                  fallbackHref={outfitsFeatureHref}
                />

                <FeatureCard
                  section={content.articlesFeature}
                  align="right"
                  fallbackHref={articlesFeatureHref}
                />
              </div>
            </Container>
          </PagePadding>
        </section>

        <style jsx global>{`
          .homepage-logo-marquee {
            animation: homepage-marquee 32s linear infinite;
          }

          @keyframes homepage-marquee {
            0% {
              transform: translateX(0);
            }

            100% {
              transform: translateX(-25%);
            }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  )
}