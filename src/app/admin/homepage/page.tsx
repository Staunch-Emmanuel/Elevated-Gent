'use client'

import { useEffect, useState } from 'react'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'

import {
  defaultHomepageContent,
  getHomepageContent,
  saveHomepageContent,
  type HomepageContent,
  type HomepageFeatureSection,
} from '@/lib/firebase/homepage'

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items
  }

  const next = [...items]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

function removeArrayItem<T>(items: T[], index: number): T[] {
  return items.filter((_, itemIndex) => itemIndex !== index)
}

export default function AdminHomepagePage() {
  const [content, setContent] =
    useState<HomepageContent>(defaultHomepageContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getHomepageContent()
        setContent(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load homepage content.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await saveHomepageContent(content)
      setMessage('Homepage updated successfully.')
    } catch (err) {
      console.error(err)
      setError('Failed to save homepage changes.')
    } finally {
      setSaving(false)
    }
  }

  function renderFeatureSectionEditor(
    key: 'weeklyFeature' | 'outfitsFeature' | 'articlesFeature',
    label: string,
    section: HomepageFeatureSection
  ) {
    return (
      <section className="space-y-6 border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
        <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
          {label}
        </h2>

        <div>
          <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
            Eyebrow
          </label>

          <input
            className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
            value={section.eyebrow || ''}
            onChange={(event) =>
              setContent((current) => ({
                ...current,
                [key]: {
                  ...current[key],
                  eyebrow: event.target.value,
                },
              }))
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
            Title
          </label>

          <input
            className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
            value={section.title}
            onChange={(event) =>
              setContent((current) => ({
                ...current,
                [key]: {
                  ...current[key],
                  title: event.target.value,
                },
              }))
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
            Description
          </label>

          <textarea
            className="min-h-[140px] w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
            value={section.description}
            onChange={(event) =>
              setContent((current) => ({
                ...current,
                [key]: {
                  ...current[key],
                  description: event.target.value,
                },
              }))
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
            Link / Href
          </label>

          <input
            className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-mono text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
            value={section.href}
            onChange={(event) =>
              setContent((current) => ({
                ...current,
                [key]: {
                  ...current[key],
                  href: event.target.value,
                },
              }))
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
            CTA Label
          </label>

          <input
            className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
            value={section.ctaLabel}
            onChange={(event) =>
              setContent((current) => ({
                ...current,
                [key]: {
                  ...current[key],
                  ctaLabel: event.target.value,
                },
              }))
            }
          />
        </div>

        <div className="border border-[#817e6c] bg-[#e8ebec] p-5">
          <CMSImageUploadField
            label={`${label} Image`}
            folder="homepage"
            documentSlug={`homepage-${key}`}
            mode="single"
            value={section.imageUrl}
            onChange={(value) =>
              setContent((current) => ({
                ...current,
                [key]: {
                  ...current[key],
                  imageUrl: typeof value === 'string' ? value : '',
                },
              }))
            }
            helpText={`Image for the ${label.toLowerCase()} block.`}
            disabled={saving}
          />
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <PagePadding>
          <Container className="py-10">
            <div className="border border-[#817e6c] bg-[#e8ebec] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
              <p className="font-serif text-[#575348]">
                Loading homepage content...
              </p>
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
          <div className="mb-8 border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8">
            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Homepage
            </h1>

            <p className="mt-3 max-w-3xl font-serif text-sm leading-6 text-[#575348]">
              Edit all homepage text, links, and images here. Use{' '}
              <span className="font-mono text-[#817e6c]">
                {'{firstName}'}
              </span>{' '}
              in the welcome title to show the signed-in user&apos;s first name
              dynamically.
            </p>
          </div>

          {message ? (
            <div className="mb-6 border border-[#9aaa83] bg-[#edf3e4] px-4 py-3 font-serif text-sm text-[#40512f]">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mb-6 border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-5 border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                Hero Section
              </h2>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                  Welcome Title
                </label>

                <input
                  className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                  value={content.welcomeTitle}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      welcomeTitle: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                  Subtitle
                </label>

                <input
                  className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                  value={content.heroSubtitle}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      heroSubtitle: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                  Description
                </label>

                <textarea
                  className="min-h-[140px] w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                  value={content.heroDescription}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      heroDescription: event.target.value,
                    }))
                  }
                />
              </div>
            </section>

            <section className="space-y-6 border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                Hero Buttons
              </h2>

              {[
                ['primaryButton', 'Primary Button'],
                ['secondaryButton', 'Secondary Button'],
              ].map(([key, label]) => {
                const buttonKey = key as
                  | 'primaryButton'
                  | 'secondaryButton'
                const button = content[buttonKey]

                return (
                  <div
                    key={buttonKey}
                    className="border border-[#817e6c] bg-[#e8ebec] p-5"
                  >
                    <h3 className="mb-4 font-editorial text-xl font-normal text-[#24231d]">
                      {label}
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#817e6c]">
                          Label
                        </label>

                        <input
                          className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                          value={button.label}
                          onChange={(event) =>
                            setContent((current) => ({
                              ...current,
                              [buttonKey]: {
                                ...current[buttonKey],
                                label: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#817e6c]">
                          Link / Href
                        </label>

                        <input
                          className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-mono text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                          value={button.href}
                          onChange={(event) =>
                            setContent((current) => ({
                              ...current,
                              [buttonKey]: {
                                ...current[buttonKey],
                                href: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>

            <section className="space-y-6 border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <div>
                <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                  Slideshow Images
                </h2>

                <p className="mt-2 font-serif text-sm text-[#575348]">
                  Upload, replace, remove, and reorder hero slideshow images.
                </p>
              </div>

              <div className="border border-[#817e6c] bg-[#e8ebec] p-5">
                <CMSImageUploadField
                  label="Homepage Slideshow Images"
                  folder="homepage"
                  documentSlug="homepage-slideshow"
                  mode="multiple"
                  value={content.slideshowImages}
                  onChange={(value) =>
                    setContent((current) => ({
                      ...current,
                      slideshowImages: Array.isArray(value) ? value : [],
                    }))
                  }
                  helpText="These images power the full-width hero slideshow."
                  disabled={saving}
                />
              </div>

              {content.slideshowImages.length > 0 ? (
                <div className="space-y-3">
                  {content.slideshowImages.map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="flex flex-col gap-4 border border-[#817e6c] bg-[#e8ebec] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <img
                          src={imageUrl}
                          alt={`Homepage slide ${index + 1}`}
                          className="h-16 w-24 border border-[#817e6c] object-cover"
                        />

                        <div className="min-w-0">
                          <p className="font-serif text-sm font-semibold text-[#24231d]">
                            Slide {index + 1}
                          </p>

                          <p className="truncate font-mono text-xs text-[#625e53]">
                            {imageUrl}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setContent((current) => ({
                              ...current,
                              slideshowImages: moveArrayItem(
                                current.slideshowImages,
                                index,
                                index - 1
                              ),
                            }))
                          }
                          disabled={index === 0 || saving}
                          className="border border-[#817e6c] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#817e6c] transition-colors hover:bg-[#817e6c] hover:text-[#e8ebec] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Move Up
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setContent((current) => ({
                              ...current,
                              slideshowImages: moveArrayItem(
                                current.slideshowImages,
                                index,
                                index + 1
                              ),
                            }))
                          }
                          disabled={
                            index === content.slideshowImages.length - 1 ||
                            saving
                          }
                          className="border border-[#817e6c] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#817e6c] transition-colors hover:bg-[#817e6c] hover:text-[#e8ebec] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Move Down
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setContent((current) => ({
                              ...current,
                              slideshowImages: removeArrayItem(
                                current.slideshowImages,
                                index
                              ),
                            }))
                          }
                          disabled={saving}
                          className="border border-[#a65a50] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#e8ebec] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="space-y-6 border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                About / Story Section
              </h2>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                  Eyebrow
                </label>

                <input
                  className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                  value={content.storySection.eyebrow}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      storySection: {
                        ...current.storySection,
                        eyebrow: event.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                  Title
                </label>

                <input
                  className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                  value={content.storySection.title}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      storySection: {
                        ...current.storySection,
                        title: event.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                  Description
                </label>

                <textarea
                  className="min-h-[160px] w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                  value={content.storySection.description}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      storySection: {
                        ...current.storySection,
                        description: event.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="border border-[#817e6c] bg-[#e8ebec] p-5">
                <CMSImageUploadField
                  label="Story Section Image"
                  folder="homepage"
                  documentSlug="homepage-story-image"
                  mode="single"
                  value={content.storySection.imageUrl}
                  onChange={(value) =>
                    setContent((current) => ({
                      ...current,
                      storySection: {
                        ...current.storySection,
                        imageUrl: typeof value === 'string' ? value : '',
                      },
                    }))
                  }
                  helpText="Large image beside the about/story text."
                  disabled={saving}
                />
              </div>

              {[
                ['primaryButton', 'Primary CTA'],
                ['secondaryButton', 'Secondary CTA'],
              ].map(([key, label]) => {
                const buttonKey = key as
                  | 'primaryButton'
                  | 'secondaryButton'
                const button = content.storySection[buttonKey]

                return (
                  <div
                    key={buttonKey}
                    className="border border-[#817e6c] bg-[#e8ebec] p-5"
                  >
                    <h3 className="mb-4 font-editorial text-xl font-normal text-[#24231d]">
                      {label}
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#817e6c]">
                          Label
                        </label>

                        <input
                          className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                          value={button.label}
                          onChange={(event) =>
                            setContent((current) => ({
                              ...current,
                              storySection: {
                                ...current.storySection,
                                [buttonKey]: {
                                  ...current.storySection[buttonKey],
                                  label: event.target.value,
                                },
                              },
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#817e6c]">
                          Link / Href
                        </label>

                        <input
                          className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-mono text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                          value={button.href}
                          onChange={(event) =>
                            setContent((current) => ({
                              ...current,
                              storySection: {
                                ...current.storySection,
                                [buttonKey]: {
                                  ...current.storySection[buttonKey],
                                  href: event.target.value,
                                },
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>

            <section className="space-y-5 border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                Explore Intro
              </h2>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                  Eyebrow
                </label>

                <input
                  className="min-h-12 w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                  value={content.exploreEyebrow}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      exploreEyebrow: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#817e6c]">
                  Title
                </label>

                <textarea
                  className="min-h-[120px] w-full border border-[#817e6c] bg-[#e8ebec] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#817e6c] focus:border-[#817e6c]"
                  value={content.exploreTitle}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      exploreTitle: event.target.value,
                    }))
                  }
                />
              </div>
            </section>

            <section className="space-y-6 border border-[#817e6c] bg-[#e8ebec] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <div>
                <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                  Partner Logos
                </h2>

                <p className="mt-2 font-serif text-sm text-[#575348]">
                  Upload, replace, remove, and reorder partner logos here.
                </p>
              </div>

              <div className="border border-[#817e6c] bg-[#e8ebec] p-5">
                <CMSImageUploadField
                  label="Partner Logos"
                  folder="homepage"
                  documentSlug="homepage-partner-logos"
                  mode="multiple"
                  value={content.partnerLogos}
                  onChange={(value) =>
                    setContent((current) => ({
                      ...current,
                      partnerLogos: Array.isArray(value) ? value : [],
                    }))
                  }
                  helpText="These will show in the scrolling logo strip."
                  disabled={saving}
                />
              </div>

              {content.partnerLogos.length > 0 ? (
                <div className="space-y-3">
                  {content.partnerLogos.map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="flex flex-col gap-4 border border-[#817e6c] bg-[#e8ebec] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <img
                          src={imageUrl}
                          alt={`Partner logo ${index + 1}`}
                          className="h-14 w-24 border border-[#817e6c] bg-[#e8ebec] object-contain p-2"
                        />

                        <p className="truncate font-mono text-xs text-[#625e53]">
                          {imageUrl}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setContent((current) => ({
                              ...current,
                              partnerLogos: moveArrayItem(
                                current.partnerLogos,
                                index,
                                index - 1
                              ),
                            }))
                          }
                          disabled={index === 0 || saving}
                          className="border border-[#817e6c] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#817e6c] transition-colors hover:bg-[#817e6c] hover:text-[#e8ebec] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Move Up
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setContent((current) => ({
                              ...current,
                              partnerLogos: moveArrayItem(
                                current.partnerLogos,
                                index,
                                index + 1
                              ),
                            }))
                          }
                          disabled={
                            index === content.partnerLogos.length - 1 ||
                            saving
                          }
                          className="border border-[#817e6c] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#817e6c] transition-colors hover:bg-[#817e6c] hover:text-[#e8ebec] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Move Down
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setContent((current) => ({
                              ...current,
                              partnerLogos: removeArrayItem(
                                current.partnerLogos,
                                index
                              ),
                            }))
                          }
                          disabled={saving}
                          className="border border-[#a65a50] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#e8ebec] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            {renderFeatureSectionEditor(
              'weeklyFeature',
              'Weekly Finds Feature',
              content.weeklyFeature
            )}

            {renderFeatureSectionEditor(
              'outfitsFeature',
              'Outfit Inspiration Feature',
              content.outfitsFeature
            )}

            {renderFeatureSectionEditor(
              'articlesFeature',
              'Articles Feature',
              content.articlesFeature
            )}

            <div className="sticky bottom-4 z-20 border border-[#817e6c] bg-[rgba(242,234,223,0.96)] p-4 shadow-[0_16px_42px_rgba(36,35,29,0.16)] backdrop-blur-xl">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center border border-[#817e6c] bg-[#817e6c] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#e8ebec] transition-colors hover:bg-transparent hover:text-[#817e6c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Homepage'}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}