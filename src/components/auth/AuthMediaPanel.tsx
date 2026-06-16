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
  const [isVideoOpen, setIsVideoOpen] = useState(false)

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

  const hasMobileVideo =
    settings.enabled && Boolean(mobileMediaSrc)

  const fallbackPoster = poster || '/images/Image-10.jpeg'

  if (loading) {
    return (
      <>
        <div className="hidden lg:flex lg:w-1/2 bg-gray-100" />
        <div className="lg:hidden absolute inset-0 bg-gray-100" />
      </>
    )
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        {hasDesktopVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={desktopVideo}
            poster={poster || undefined}
            autoPlay={settings.autoplay}
            muted={settings.muted}
            loop={settings.loop}
            playsInline
          />
        ) : (
          <Image
            src={fallbackPoster}
            alt="The Elevated Gentleman Fashion"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="mb-2 text-2xl font-semibold font-sans">
            {settings.headline || 'ELEVATE YOUR STYLE'}
          </h2>

          <p className="font-serif text-white/90">
            {settings.subheadline ||
              'Professional styling services for the modern gentleman'}
          </p>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden absolute inset-0 overflow-hidden bg-black">
        <Image
          src={fallbackPoster}
          alt="The Elevated Gentleman Fashion"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent" />

        {hasMobileVideo && (
          <button
            type="button"
            onClick={() => setIsVideoOpen(true)}
            className="absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30"
            aria-label="Play preview video"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-lg">
              <svg
                className="ml-1 h-7 w-7"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}

        <div className="absolute bottom-6 left-5 right-5 text-white pointer-events-none">
          <h2 className="mb-2 text-2xl font-semibold font-sans">
            {settings.headline || 'ELEVATE YOUR STYLE'}
          </h2>

          <p className="max-w-sm text-sm font-serif leading-relaxed text-white/90">
            {settings.subheadline ||
              'Professional styling services for the modern gentleman'}
          </p>
        </div>
      </div>

      {/* Mobile Video Modal */}
      {isVideoOpen && hasMobileVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsVideoOpen(false)}
            className="absolute right-4 top-4 z-[10000] rounded-full bg-white/10 p-3 text-white backdrop-blur-sm"
            aria-label="Close video"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <video
            src={mobileMediaSrc}
            poster={poster || undefined}
            controls
            autoPlay
            playsInline
            className="max-h-[80vh] w-full rounded-2xl bg-black"
          />
        </div>
      )}
    </>
  )
}