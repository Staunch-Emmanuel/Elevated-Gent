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

  const hasMobileVideo =
    settings.enabled && Boolean(mobileMediaSrc)

  const fallbackPoster = poster || '/images/Image-10.jpeg'

  useEffect(() => {
    if (!hasMobileVideo || hasAutoOpened) return

    const timer = setTimeout(() => {
      setShowMobilePopup(true)
      setHasAutoOpened(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [hasMobileVideo, hasAutoOpened])

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
            className="absolute inset-0 w-full h-full object-cover"
            src={desktopVideo}
            poster={poster || undefined}
            autoPlay={settings.autoplay}
            muted={settings.muted}
            loop={settings.loop}
            playsInline
            controls
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

        <div className="absolute inset-0 bg-black/25 pointer-events-none" />

        <div className="absolute bottom-8 left-8 right-8 text-white pointer-events-none">
          <h2 className="text-2xl font-semibold font-sans mb-2">
            {settings.headline || 'ELEVATE YOUR STYLE'}
          </h2>

          <p className="text-white/90 font-serif">
            {settings.subheadline ||
              'Professional styling services for the modern gentleman'}
          </p>
        </div>
      </div>

      {/* Mobile Background */}
      <div className="lg:hidden absolute inset-0 overflow-hidden bg-black">
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

        <div className="absolute bottom-6 left-5 right-5 text-white pointer-events-none">
          <h2 className="text-2xl font-semibold font-sans mb-2">
            {settings.headline || 'ELEVATE YOUR STYLE'}
          </h2>

          <p className="text-white/90 text-sm font-serif leading-relaxed max-w-sm">
            {settings.subheadline ||
              'Professional styling services for the modern gentleman'}
          </p>
        </div>
      </div>

      {/* Mobile Popup */}
      {hasMobileVideo && showMobilePopup && (
        <div className="lg:hidden fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setShowMobilePopup(false)}
          />

          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setShowMobilePopup(false)}
              className="absolute right-3 top-3 z-[10000] flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-xl text-white shadow-lg"
            >
              ×
            </button>

            <video
              key={mobileMediaSrc}
              className="aspect-video w-full"
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
      )}
    </>
  )
}