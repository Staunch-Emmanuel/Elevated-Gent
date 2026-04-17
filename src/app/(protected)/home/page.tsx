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

  for (let i = 0; i < minRepeats; i += 1) {
    repeated.push(...valid)
  }

  return repeated
}

function normalizeHomepageHref(href: string | undefined, fallback: string) {
  const raw = String(href || '').trim()
  if (!raw) return fallback

  if (raw === '/weekly-finds') return '/weekly'
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
  const href = normalizeHomepageHref(section.href, fallbackHref)

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#d9d5cc]">
        {section.imageUrl ? (
          <Image
            src={section.imageUrl}
            alt={section.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,_#d6d0c5_0%,_#b7afa2_100%)]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.45)_100%)]" />

        <div
          className={`absolute inset-x-0 bottom-0 p-6 text-white md:p-8 ${
            align === 'right' ? 'text-right' : 'text-left'
          }`}
        >
          {section.eyebrow ? (
            <p className="mb-2 font-sans text-[11px] uppercase tracking-[0.28em] text-white/75">
              {section.eyebrow}
            </p>
          ) : null}
          <h3 className="font-sans text-3xl font-semibold leading-tight md:text-4xl">
            {section.title}
          </h3>
        </div>
      </div>

      <div className="space-y-4 p-6 md:p-8">
        <p className="font-serif text-base leading-relaxed text-black/70 md:text-lg">
          {section.description}
        </p>

        <span className="inline-flex items-center font-sans text-xs uppercase tracking-[0.24em] text-black">
          {section.ctaLabel || 'Explore'}
        </span>
      </div>
    </Link>
  )
}

function buildRollingHeroImages(images: string[]): string[] {
  const valid = images.filter(Boolean)

  if (valid.length === 0) {
    return ['', '', '', '', '']
  }

  if (valid.length === 1) {
    return [valid[0], valid[0], valid[0], valid[0], valid[0], valid[0]]
  }

  if (valid.length === 2) {
    return [valid[0], valid[1], valid[0], valid[1], valid[0], valid[1]]
  }

  return [...valid, ...valid]
}

export default function HomePage() {
  const { user } = useAuth()

  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent)
  const [loading, setLoading] = useState(true)
  const [activeHeroIndex, setActiveHeroIndex] = useState(0)
  const [heroTransitionEnabled, setHeroTransitionEnabled] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getHomepageContent()
        setContent(data)
      } catch (error) {
        console.error('Failed to load homepage content:', error)
        setContent(defaultHomepageContent)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const heroImages = useMemo(() => {
    return buildRollingHeroImages(content.slideshowImages)
  }, [content.slideshowImages])

  const baseHeroImageCount = Math.max(content.slideshowImages.filter(Boolean).length, 0)
  const totalHeroSteps = Math.max(baseHeroImageCount, 1)

  useEffect(() => {
    if (baseHeroImageCount <= 1) return

    const interval = window.setInterval(() => {
      setActiveHeroIndex((current) => current + 1)
    }, 2800)

    return () => window.clearInterval(interval)
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

      return () => window.clearTimeout(resetTimer)
    }
  }, [activeHeroIndex, totalHeroSteps, baseHeroImageCount])

  const firstName = useMemo(() => {
    return user?.displayName?.split(' ')[0] || 'there'
  }, [user])

  const welcomeTitle = useMemo(() => {
    return replaceFirstName(content.welcomeTitle, firstName)
  }, [content.welcomeTitle, firstName])

  const heroPrimaryHref = normalizeHomepageHref(
    content.primaryButton.href,
    '/outfit-inspiration#categories'
  )
  const heroSecondaryHref = normalizeHomepageHref(
    content.secondaryButton.href,
    '/weekly'
  )
  const storyPrimaryHref = normalizeHomepageHref(
    content.storySection.primaryButton.href,
    '/weekly?category=closet-staples'
  )
  const storySecondaryHref = normalizeHomepageHref(
    content.storySection.secondaryButton.href,
    '/personal-styling'
  )

  const weeklyFeatureHref = normalizeHomepageHref(content.weeklyFeature.href, '/weekly')
  const outfitsFeatureHref = normalizeHomepageHref(
    content.outfitsFeature.href,
    '/outfit-inspiration#categories'
  )
  const articlesFeatureHref = normalizeHomepageHref(content.articlesFeature.href, '/articles')

  const logoTrack = buildLogoTrack(content.partnerLogos)
  const storyImage =
    content.storySection.imageUrl ||
    content.weeklyFeature.imageUrl ||
    content.outfitsFeature.imageUrl ||
    ''

  return (
    <ProtectedRoute>
      <StructuredData pageKey="home" />

      <div className="min-h-screen bg-[#FEFFFE] text-black">
        <section className="relative overflow-hidden bg-[#FEFFFE]">
          <div className="absolute inset-0">
            <div
              className={`flex h-full ease-in-out ${
                heroTransitionEnabled ? 'transition-transform duration-[1400ms]' : ''
              }`}
              style={{ transform: `translateX(-${activeHeroIndex * 33.3333}%)` }}
            >
              {heroImages.map((imageUrl, index) => (
                <div
                  key={`${imageUrl || 'fallback'}-${index}`}
                  className="relative h-full w-1/3 shrink-0 overflow-hidden bg-[#d9d5cc]"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`Homepage hero image ${index + 1}`}
                      fill
                      priority={index < 3}
                      className="object-cover"
                      sizes="33vw"
                    />
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(135deg,_#d8d1c4_0%,_#bdb3a4_100%)]" />
                  )}
                </div>
              ))}
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.28)_38%,rgba(0,0,0,0.58)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.3)_82%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.42)_80%)]" />
          </div>

          <PagePadding>
            <Container className="relative z-10">
              <div className="flex min-h-[84vh] items-center justify-center py-16 md:min-h-[92vh] md:py-20">
                <div className="max-w-4xl text-center text-white">
                  <div className="space-y-4 md:space-y-6">
                    <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-white/80">
                      {loading ? 'Loading homepage...' : 'The Elevated Gentleman'}
                    </p>

                    <h1 className="font-sans text-5xl font-semibold leading-[0.92] md:text-7xl lg:text-[5.8rem]">
                      {welcomeTitle}
                    </h1>

                    <h2 className="mx-auto max-w-3xl font-sans text-2xl font-medium leading-tight text-white/95 md:text-3xl lg:text-[2.2rem]">
                      {content.heroSubtitle}
                    </h2>

                    <p className="mx-auto max-w-2xl font-serif text-lg leading-relaxed text-white/88 md:text-[1.2rem]">
                      {content.heroDescription}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="border border-white/70 bg-black/78 text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-sm transition hover:border-white hover:bg-black"
                    >
                      <Link href={heroPrimaryHref}>{content.primaryButton.label}</Link>
                    </Button>

                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-white bg-transparent text-white hover:bg-white hover:text-black"
                    >
                      <Link href={heroSecondaryHref}>{content.secondaryButton.label}</Link>
                    </Button>
                  </div>

                  {totalHeroSteps > 1 ? (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      {Array.from({ length: totalHeroSteps }).map((_, index) => (
                        <button
                          key={`hero-dot-${index}`}
                          type="button"
                          onClick={() => {
                            setHeroTransitionEnabled(true)
                            setActiveHeroIndex(index)
                          }}
                          className={`h-2.5 rounded-full transition-all ${
                            index === (activeHeroIndex % totalHeroSteps)
                              ? 'w-9 bg-white'
                              : 'w-2.5 bg-white/45 hover:bg-white/75'
                          }`}
                          aria-label={`Show hero position ${index + 1}`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </Container>
          </PagePadding>
        </section>

        <section className="flex min-h-screen items-center justify-center py-20 md:py-24">
          <PagePadding>
            <Container>
              <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                <div className="mx-auto max-w-xl space-y-8 lg:mx-0">
                  <div className="space-y-6">
                    <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-black/45">
                      {content.storySection.eyebrow}
                    </p>

                    <h2 className="max-w-3xl font-sans text-4xl font-semibold leading-[1] md:text-6xl">
                      {content.storySection.title}
                    </h2>

                    <p className="max-w-2xl font-serif text-lg leading-relaxed text-black/72 md:text-[1.18rem]">
                      {content.storySection.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button asChild size="lg">
                      <Link href={storyPrimaryHref}>
                        {content.storySection.primaryButton.label}
                      </Link>
                    </Button>

                    <Button asChild size="lg" variant="outline">
                      <Link href={storySecondaryHref}>
                        {content.storySection.secondaryButton.label}
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#FEFFFE] shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:min-h-[620px]">
                  {storyImage ? (
                    <Image
                      src={storyImage}
                      alt={content.storySection.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 45vw"
                    />
                  ) : (
                    <div className="h-full w-full bg-[linear-gradient(135deg,_#d4cec1_0%,_#b6ad9d_100%)]" />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.18)_100%)]" />
                </div>
              </div>
            </Container>
          </PagePadding>
        </section>

        {logoTrack.length > 0 ? (
          <section className="border-y border-black/10 bg-white py-5">
            <div className="overflow-hidden">
              <div className="homepage-logo-marquee flex w-max items-center gap-16 px-8">
                {logoTrack.map((logoUrl, index) => (
                  <div
                    key={`${logoUrl}-${index}`}
                    className="relative h-10 w-28 shrink-0 opacity-70 grayscale transition hover:opacity-100"
                  >
                    <Image
                      src={logoUrl}
                      alt={`Partner logo ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="112px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="py-18 md:py-24">
          <PagePadding>
            <Container>
              <div className="mb-10 max-w-2xl space-y-4">
                <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-black/45">
                  {content.exploreEyebrow}
                </p>
                <h2 className="font-sans text-4xl font-semibold leading-tight md:text-5xl">
                  {content.exploreTitle}
                </h2>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <FeatureCard section={content.weeklyFeature} fallbackHref={weeklyFeatureHref} />
                <FeatureCard section={content.outfitsFeature} fallbackHref={outfitsFeatureHref} />
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