'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import { type AuthMediaSettings } from '@/lib/firebase/siteSettings'

const fallbackSettings: AuthMediaSettings = {
  id: 'authMedia',
  videoUrl: '',
  posterImageUrl: '',
  mobileVideoUrl: '',
  enabled: false,
  autoplay: true,
  muted: true,
  loop: true,
  headline: 'ELEVATE YOUR STYLE',
  subheadline: 'Professional styling services for the modern gentleman',
}

export default function AuthMediaPanel() {
  const [settings, setSettings] = useState<AuthMediaSettings>(fallbackSettings)
  const [loading, setLoading] = useState(true)

  const [showMobilePopup, setShowMobilePopup] = useState(false)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const response = await fetch('/api/site-settings/auth-media', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch auth media settings.')
        }

        const data = (await response.json()) as AuthMediaSettings

        if (!active) return

        setSettings({
          ...fallbackSettings,
          ...data,
        })
      } catch (err) {
        console.error('Failed to load auth media settings:', err)

        if (!active) return

        setSettings(fallbackSettings)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const desktopVideo = useMemo(
    () => (settings.videoUrl || '').trim(),
    [settings.videoUrl]
  )

  const mobileVideo = useMemo(
    () => (settings.mobileVideoUrl || '').trim(),
    [settings.mobileVideoUrl]
  )

  const poster = useMemo(
    () => (settings.posterImageUrl || '').trim(),
    [settings.posterImageUrl]
  )

  const hasDesktopVideo = settings.enabled && Boolean(desktopVideo)

  const mobileMediaSrc = mobileVideo || desktopVideo

  const hasMobileVideo = settings.enabled && Boolean(mobileMediaSrc)

  const fallbackPoster = poster || '/images/Image-10.jpeg'

  useEffect(() => {
    if (!hasMobileVideo || hasAutoOpened) return

    const timer = setTimeout(() => {
      setShowMobilePopup(true)
      setHasAutoOpened(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [hasMobileVideo, hasAutoOpened])

  useEffect(() => {
    if (!showMobilePopup) return

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [showMobilePopup])

  if (loading) {
    return (
      <>
        <div className="hidden bg-gray-100 lg:flex lg:w-1/2" />
        <div className="absolute inset-0 bg-gray-100 lg:hidden" />
      </>
    )
  }

  return (
    <>
      {/* Desktop */}
      <div className="relative hidden overflow-hidden bg-black lg:flex lg:w-1/2">
        {hasDesktopVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={desktopVideo}
            poster={poster || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        ) : (
          <Image
            src={fallbackPoster}
            alt="The Elevated Gentleman Fashion"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-black/25" />

        <div className="pointer-events-none absolute bottom-8 left-8 right-8 text-white">
          <h2 className="mb-2 font-sans text-2xl font-semibold">
            {settings.headline || 'ELEVATE YOUR STYLE'}
          </h2>

          <p className="font-serif text-white/90">
            {settings.subheadline ||
              'Professional styling services for the modern gentleman'}
          </p>
        </div>
      </div>

      {/* Mobile Background */}
      <div className="absolute inset-0 overflow-hidden bg-black lg:hidden">
        <Image
          src={fallbackPoster}
          alt="The Elevated Gentleman Fashion"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="pointer-events-none absolute bottom-6 left-5 right-5 text-white">
          <h2 className="mb-2 font-sans text-2xl font-semibold">
            {settings.headline || 'ELEVATE YOUR STYLE'}
          </h2>

          <p className="max-w-sm font-serif text-sm leading-relaxed text-white/90">
            {settings.subheadline ||
              'Professional styling services for the modern gentleman'}
          </p>
        </div>
      </div>

      {/* Mobile Popup */}
      {hasMobileVideo && showMobilePopup ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden overscroll-contain p-4 lg:hidden">
          <div
            className="absolute inset-0 bg-black/85"
            onClick={() => setShowMobilePopup(false)}
          />

          <div className="relative z-10 w-full min-w-0 max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setShowMobilePopup(false)}
              aria-label="Close video"
              className="absolute right-2 top-2 z-[10000] flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-black/80 text-2xl leading-none text-white shadow-lg"
            >
              ×
            </button>

            <video
              key={mobileMediaSrc}
              className="block max-h-[calc(100dvh-2rem)] w-full object-contain"
              src={mobileMediaSrc}
              poster={poster || undefined}
              autoPlay
              controls
              playsInline
              muted={settings.muted}
              loop={settings.loop}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}