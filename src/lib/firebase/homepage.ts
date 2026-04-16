'use client'

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

const COLLECTION = 'siteContent'
const DOCUMENT_ID = 'homepage'

export interface HomepageButton {
  label: string
  href: string
}

export interface HomepageStorySection {
  eyebrow: string
  title: string
  description: string
  imageUrl: string
  primaryButton: HomepageButton
  secondaryButton: HomepageButton
}

export interface HomepageFeatureSection {
  eyebrow: string
  title: string
  description: string
  href: string
  imageUrl: string
  ctaLabel: string
}

export interface HomepageContent {
  welcomeTitle: string
  heroSubtitle: string
  heroDescription: string
  primaryButton: HomepageButton
  secondaryButton: HomepageButton
  slideshowImages: string[]
  storySection: HomepageStorySection
  partnerLogos: string[]
  exploreEyebrow: string
  exploreTitle: string
  weeklyFeature: HomepageFeatureSection
  outfitsFeature: HomepageFeatureSection
  articlesFeature: HomepageFeatureSection
  createdAt?: any
  updatedAt?: any
}

export const defaultHomepageContent: HomepageContent = {
  welcomeTitle: 'Welcome back, {firstName}',
  heroSubtitle: 'Your Blueprint To Timeless Style',
  heroDescription:
    'Discover curated outfits, this week’s standout finds, and timeless essentials designed to make getting dressed feel elevated, intentional, and effortless.',
  primaryButton: {
    label: 'Find Your Outfit',
    href: '/outfit-inspiration#categories',
  },
  secondaryButton: {
    label: 'This Week’s Selects',
    href: '/weekly',
  },
  slideshowImages: [],
  storySection: {
    eyebrow: "Mark's Story",
    title: 'A Timeless Wardrobe Starts With Closet Staples',
    description:
      'Some sort of text box where I can tell people my story, the website’s story, and what fashion means to me.',
    imageUrl: '',
    primaryButton: {
      label: 'Closet Staples',
      href: '/weekly?category=closet-staples',
    },
    secondaryButton: {
      label: 'Personal Styling',
      href: '/personal-styling',
    },
  },
  partnerLogos: [],
  exploreEyebrow: 'Explore The Site',
  exploreTitle: 'Curated sections built like a real destination, not just a feed.',
  weeklyFeature: {
    eyebrow: 'Weekly Finds',
    title: "This Week's Selects",
    description:
      'Browse featured weekly picks, standout essentials, and curated pieces worth your attention right now.',
    href: '/weekly',
    imageUrl: '',
    ctaLabel: 'Explore',
  },
  outfitsFeature: {
    eyebrow: 'Outfit Inspiration',
    title: 'Find Your Outfit',
    description:
      'Explore outfit inspiration by category and discover looks tailored to your mood, occasion, and style direction.',
    href: '/outfit-inspiration#categories',
    imageUrl: '',
    ctaLabel: 'Explore',
  },
  articlesFeature: {
    eyebrow: 'Articles',
    title: 'Style, Grooming, Wellness',
    description:
      'Read thoughtful editorial content covering style, grooming, wellness, and lifestyle with a sharper point of view.',
    href: '/articles',
    imageUrl: '',
    ctaLabel: 'Explore',
  },
}

function normalizeButton(input: any, fallback: HomepageButton): HomepageButton {
  return {
    label: typeof input?.label === 'string' ? input.label : fallback.label,
    href: typeof input?.href === 'string' ? input.href : fallback.href,
  }
}

function normalizeStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback
  return value.map((item) => String(item ?? '').trim()).filter(Boolean)
}

function normalizeFeatureSection(
  input: any,
  fallback: HomepageFeatureSection
): HomepageFeatureSection {
  return {
    eyebrow: typeof input?.eyebrow === 'string' ? input.eyebrow : fallback.eyebrow,
    title: typeof input?.title === 'string' ? input.title : fallback.title,
    description:
      typeof input?.description === 'string' ? input.description : fallback.description,
    href: typeof input?.href === 'string' ? input.href : fallback.href,
    imageUrl: typeof input?.imageUrl === 'string' ? input.imageUrl.trim() : fallback.imageUrl,
    ctaLabel: typeof input?.ctaLabel === 'string' ? input.ctaLabel : fallback.ctaLabel,
  }
}

function normalizeContent(data: any): HomepageContent {
  return {
    welcomeTitle:
      typeof data?.welcomeTitle === 'string'
        ? data.welcomeTitle
        : defaultHomepageContent.welcomeTitle,
    heroSubtitle:
      typeof data?.heroSubtitle === 'string'
        ? data.heroSubtitle
        : defaultHomepageContent.heroSubtitle,
    heroDescription:
      typeof data?.heroDescription === 'string'
        ? data.heroDescription
        : defaultHomepageContent.heroDescription,
    primaryButton: normalizeButton(data?.primaryButton, defaultHomepageContent.primaryButton),
    secondaryButton: normalizeButton(data?.secondaryButton, defaultHomepageContent.secondaryButton),
    slideshowImages: normalizeStringArray(
      data?.slideshowImages,
      defaultHomepageContent.slideshowImages
    ),
    storySection: {
      eyebrow:
        typeof data?.storySection?.eyebrow === 'string'
          ? data.storySection.eyebrow
          : defaultHomepageContent.storySection.eyebrow,
      title:
        typeof data?.storySection?.title === 'string'
          ? data.storySection.title
          : defaultHomepageContent.storySection.title,
      description:
        typeof data?.storySection?.description === 'string'
          ? data.storySection.description
          : defaultHomepageContent.storySection.description,
      imageUrl:
        typeof data?.storySection?.imageUrl === 'string'
          ? data.storySection.imageUrl.trim()
          : defaultHomepageContent.storySection.imageUrl,
      primaryButton: normalizeButton(
        data?.storySection?.primaryButton,
        defaultHomepageContent.storySection.primaryButton
      ),
      secondaryButton: normalizeButton(
        data?.storySection?.secondaryButton,
        defaultHomepageContent.storySection.secondaryButton
      ),
    },
    partnerLogos: normalizeStringArray(
      data?.partnerLogos,
      defaultHomepageContent.partnerLogos
    ),
    exploreEyebrow:
      typeof data?.exploreEyebrow === 'string'
        ? data.exploreEyebrow
        : defaultHomepageContent.exploreEyebrow,
    exploreTitle:
      typeof data?.exploreTitle === 'string'
        ? data.exploreTitle
        : defaultHomepageContent.exploreTitle,
    weeklyFeature: normalizeFeatureSection(
      data?.weeklyFeature,
      defaultHomepageContent.weeklyFeature
    ),
    outfitsFeature: normalizeFeatureSection(
      data?.outfitsFeature,
      defaultHomepageContent.outfitsFeature
    ),
    articlesFeature: normalizeFeatureSection(
      data?.articlesFeature,
      defaultHomepageContent.articlesFeature
    ),
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  }
}

function cleanButton(button: HomepageButton): HomepageButton {
  return {
    label: String(button?.label ?? '').trim(),
    href: String(button?.href ?? '').trim(),
  }
}

function cleanFeatureSection(section: HomepageFeatureSection) {
  return {
    eyebrow: String(section?.eyebrow ?? '').trim(),
    title: String(section?.title ?? '').trim(),
    description: String(section?.description ?? '').trim(),
    href: String(section?.href ?? '').trim(),
    imageUrl: String(section?.imageUrl ?? '').trim(),
    ctaLabel: String(section?.ctaLabel ?? '').trim(),
  }
}

function cleanContent(content: HomepageContent) {
  return {
    welcomeTitle: String(content?.welcomeTitle ?? '').trim(),
    heroSubtitle: String(content?.heroSubtitle ?? '').trim(),
    heroDescription: String(content?.heroDescription ?? '').trim(),
    primaryButton: cleanButton(content.primaryButton),
    secondaryButton: cleanButton(content.secondaryButton),
    slideshowImages: normalizeStringArray(content?.slideshowImages),
    storySection: {
      eyebrow: String(content?.storySection?.eyebrow ?? '').trim(),
      title: String(content?.storySection?.title ?? '').trim(),
      description: String(content?.storySection?.description ?? '').trim(),
      imageUrl: String(content?.storySection?.imageUrl ?? '').trim(),
      primaryButton: cleanButton(content.storySection.primaryButton),
      secondaryButton: cleanButton(content.storySection.secondaryButton),
    },
    partnerLogos: normalizeStringArray(content?.partnerLogos),
    exploreEyebrow: String(content?.exploreEyebrow ?? '').trim(),
    exploreTitle: String(content?.exploreTitle ?? '').trim(),
    weeklyFeature: cleanFeatureSection(content.weeklyFeature),
    outfitsFeature: cleanFeatureSection(content.outfitsFeature),
    articlesFeature: cleanFeatureSection(content.articlesFeature),
  }
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const ref = doc(db, COLLECTION, DOCUMENT_ID)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    return defaultHomepageContent
  }

  return normalizeContent(snap.data())
}

export async function saveHomepageContent(content: HomepageContent): Promise<void> {
  const ref = doc(db, COLLECTION, DOCUMENT_ID)
  const existing = await getDoc(ref)

  await setDoc(
    ref,
    {
      ...cleanContent(content),
      updatedAt: serverTimestamp(),
      createdAt: existing.exists()
        ? existing.data().createdAt ?? serverTimestamp()
        : serverTimestamp(),
    },
    { merge: true }
  )
}