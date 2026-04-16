'use client'

import { useEffect, useState } from 'react'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'
import CMSVideoUploadField from '@/components/admin/CMSVideoUploadField'
import type { AuthMediaSettings } from '@/lib/firebase/siteSettings'
import { auth } from '@/lib/firebase/config'

const defaultForm: AuthMediaSettings = {
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

export default function AdminAuthMediaPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState<AuthMediaSettings>(defaultForm)

  useEffect(() => {
    async function load() {
      try {
        setError('')

        const response = await fetch('/api/site-settings/auth-media', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to load auth media settings.')
        }

        const settings = (await response.json()) as AuthMediaSettings

        setForm({
          ...defaultForm,
          ...settings,
          id: settings.id || 'authMedia',
          videoUrl: settings.videoUrl || '',
          posterImageUrl: settings.posterImageUrl || '',
          mobileVideoUrl: settings.mobileVideoUrl || '',
          enabled: Boolean(settings.enabled),
          autoplay: settings.autoplay !== false,
          muted: settings.muted !== false,
          loop: settings.loop !== false,
          headline: settings.headline || defaultForm.headline,
          subheadline: settings.subheadline || defaultForm.subheadline,
        })
      } catch (err) {
        console.error(err)
        setError('Failed to load auth media settings.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const currentUser = auth.currentUser

      if (!currentUser) {
        throw new Error('You must be signed in as an admin to save auth media.')
      }

      const token = await currentUser.getIdToken()

      const response = await fetch('/api/site-settings/auth-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoUrl: form.videoUrl || '',
          posterImageUrl: form.posterImageUrl || '',
          mobileVideoUrl: form.mobileVideoUrl || '',
          enabled: Boolean(form.enabled),
          autoplay: Boolean(form.autoplay),
          muted: Boolean(form.muted),
          loop: Boolean(form.loop),
          headline: form.headline || '',
          subheadline: form.subheadline || '',
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to save auth media settings.')
      }

      const saved = payload?.data as AuthMediaSettings | undefined

      if (saved) {
        setForm({
          ...defaultForm,
          ...saved,
        })
      }

      setSuccess('Auth media settings saved successfully.')
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : 'Failed to save auth media settings.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <PagePadding>
          <Container>
            <p>Loading...</p>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-4xl py-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">
              Auth Experience
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black">
              Auth Page Media
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Edit the image, desktop video, mobile video, and overlay copy used on
              the sign-in and sign-up pages.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            ) : null}

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-black">Playback Settings</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Control whether video plays and how it behaves on the auth pages.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  {
                    key: 'enabled',
                    label: 'Enable auth video',
                    checked: Boolean(form.enabled),
                  },
                  {
                    key: 'autoplay',
                    label: 'Autoplay',
                    checked: Boolean(form.autoplay),
                  },
                  {
                    key: 'muted',
                    label: 'Muted',
                    checked: Boolean(form.muted),
                  },
                  {
                    key: 'loop',
                    label: 'Loop',
                    checked: Boolean(form.loop),
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-black"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-black">Overlay Copy</h2>
                <p className="mt-1 text-sm text-gray-500">
                  This text appears over the auth background media.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Headline
                  </label>
                  <input
                    value={form.headline || ''}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        headline: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Subheadline
                  </label>
                  <textarea
                    value={form.subheadline || ''}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        subheadline: e.target.value,
                      }))
                    }
                    className="min-h-[110px] w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-black">Media Assets</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Poster Image = auth background / fallback image. Desktop and mobile
                  videos are used on the auth pages when video is enabled.
                </p>
              </div>

              <div className="space-y-8">
                <CMSVideoUploadField
                  label="Desktop / Primary Video"
                  folder="auth"
                  documentSlug="auth-video"
                  value={form.videoUrl || ''}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      videoUrl: value,
                    }))
                  }
                  helpText="Main login/signup preview video."
                  disabled={saving}
                />

                <CMSVideoUploadField
                  label="Mobile Video (optional)"
                  folder="auth"
                  documentSlug="auth-video-mobile"
                  value={form.mobileVideoUrl || ''}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      mobileVideoUrl: value,
                    }))
                  }
                  helpText="Optional separate mobile version."
                  disabled={saving}
                />

                <CMSImageUploadField
                  label="Poster Image"
                  folder="auth"
                  documentSlug="auth-video-poster"
                  mode="single"
                  value={form.posterImageUrl || ''}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      posterImageUrl: typeof value === 'string' ? value : '',
                    }))
                  }
                  helpText="Shown before the video loads or as the image fallback."
                  disabled={saving}
                />
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Auth Media'}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}