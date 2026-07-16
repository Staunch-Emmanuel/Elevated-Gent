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
          subheadline:
            settings.subheadline || defaultForm.subheadline,
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
        throw new Error(
          'You must be signed in as an admin to save auth media.'
        )
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
        throw new Error(
          payload?.error || 'Failed to save auth media settings.'
        )
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
        err instanceof Error
          ? err.message
          : 'Failed to save auth media settings.'
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
            <div className="py-12">
              <div className="border border-[#c8bcaa] bg-[#f2eadf] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
                <p className="font-serif text-[#575348]">
                  Loading...
                </p>
              </div>
            </div>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-5xl py-10 md:py-12">
          <div className="mb-8 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[#625e53]">
              Auth Experience
            </p>

            <h1 className="mt-2 font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Auth Page Media
            </h1>

            <p className="mt-3 max-w-3xl font-serif text-sm leading-6 text-[#575348]">
              Edit the image, desktop video, mobile video, and overlay
              copy used on the sign-in and sign-up pages.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error ? (
              <div className="border border-[#d9aaa4] bg-[#fbefed] px-4 py-3">
                <p className="font-serif text-sm text-[#913a32]">
                  {error}
                </p>
              </div>
            ) : null}

            {success ? (
              <div className="border border-[#9aaa83] bg-[#edf3e4] px-4 py-3">
                <p className="font-serif text-sm text-[#40512f]">
                  {success}
                </p>
              </div>
            ) : null}

            <section className="border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <div className="mb-6">
                <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                  Playback Settings
                </h2>

                <p className="mt-2 font-serif text-sm leading-6 text-[#575348]">
                  Control whether video plays and how it behaves on the
                  auth pages.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                    className="flex min-h-14 cursor-pointer items-center gap-3 border border-[#c8bcaa] bg-[#e9dfd1] px-4 py-3 font-serif text-sm text-[#24231d] transition-colors hover:border-[#77725d] hover:bg-[#f8f1e5]"
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
                      className="h-4 w-4 shrink-0 accent-[#4f4b3b]"
                    />

                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <div className="mb-6">
                <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                  Overlay Copy
                </h2>

                <p className="mt-2 font-serif text-sm leading-6 text-[#575348]">
                  This text appears over the auth background media.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
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
                    className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
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
                    className="min-h-[130px] w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                  />
                </div>
              </div>
            </section>

            <section className="border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <div className="mb-6">
                <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                  Media Assets
                </h2>

                <p className="mt-2 max-w-3xl font-serif text-sm leading-6 text-[#575348]">
                  Poster Image = auth background / fallback image.
                  Desktop and mobile videos are used on the auth pages
                  when video is enabled.
                </p>
              </div>

              <div className="space-y-6">
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
                      posterImageUrl:
                        typeof value === 'string' ? value : '',
                    }))
                  }
                  helpText="Shown before the video loads or as the image fallback."
                  disabled={saving}
                />
              </div>
            </section>

            <div className="sticky bottom-4 z-20 flex justify-end border border-[#c8bcaa] bg-[rgba(242,234,223,0.96)] p-4 shadow-[0_16px_42px_rgba(36,35,29,0.16)] backdrop-blur-xl">
              <button
                type="submit"
                disabled={saving}
                className="border border-[#4f4b3b] bg-[#4f4b3b] px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f1e5] transition-colors hover:bg-transparent hover:text-[#4f4b3b] disabled:cursor-not-allowed disabled:opacity-60"
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