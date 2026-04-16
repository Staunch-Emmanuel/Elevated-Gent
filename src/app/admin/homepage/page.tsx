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
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent)
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
      <section className="space-y-6 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">{label}</h2>

        <div>
          <label className="mb-1 block text-sm font-medium">Eyebrow</label>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
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
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
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
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            className="min-h-[120px] w-full rounded border px-3 py-2 text-sm"
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
          <label className="mb-1 block text-sm font-medium">Link / Href</label>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
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
          <label className="mb-1 block text-sm font-medium">CTA Label</label>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
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
      </section>
    )
  }

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <PagePadding>
          <Container className="py-10">
            <p>Loading homepage content...</p>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin>
      <PagePadding>
        <Container className="max-w-5xl py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">Homepage</h1>
            <p className="mt-2 text-sm text-gray-500">
              Edit all homepage text, links, and images here. Use{' '}
              <span className="font-mono">{'{firstName}'}</span> in the welcome
              title to show the signed-in user&apos;s first name dynamically.
            </p>
          </div>

          {message ? (
            <div className="mb-6 rounded border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mb-6 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-4 rounded-lg border p-6">
              <h2 className="text-xl font-semibold">Hero Section</h2>

              <div>
                <label className="mb-1 block text-sm font-medium">Welcome Title</label>
                <input
                  className="w-full rounded border px-3 py-2 text-sm"
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
                <label className="mb-1 block text-sm font-medium">Subtitle</label>
                <input
                  className="w-full rounded border px-3 py-2 text-sm"
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
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  className="min-h-[120px] w-full rounded border px-3 py-2 text-sm"
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

            <section className="space-y-6 rounded-lg border p-6">
              <h2 className="text-xl font-semibold">Hero Buttons</h2>

              {[
                ['primaryButton', 'Primary Button'],
                ['secondaryButton', 'Secondary Button'],
              ].map(([key, label]) => {
                const buttonKey = key as 'primaryButton' | 'secondaryButton'
                const button = content[buttonKey]

                return (
                  <div key={buttonKey} className="rounded border p-4">
                    <h3 className="mb-4 font-medium">{label}</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Label</label>
                        <input
                          className="w-full rounded border px-3 py-2 text-sm"
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
                        <label className="mb-1 block text-sm font-medium">Link / Href</label>
                        <input
                          className="w-full rounded border px-3 py-2 text-sm"
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

            <section className="space-y-6 rounded-lg border p-6">
              <div>
                <h2 className="text-xl font-semibold">Slideshow Images</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload, replace, remove, and reorder hero slideshow images.
                </p>
              </div>

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

              {content.slideshowImages.length > 0 ? (
                <div className="space-y-3">
                  {content.slideshowImages.map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="flex flex-col gap-3 rounded border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <img
                          src={imageUrl}
                          alt={`Homepage slide ${index + 1}`}
                          className="h-16 w-24 rounded object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">Slide {index + 1}</p>
                          <p className="truncate text-xs text-gray-500">{imageUrl}</p>
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
                          className="rounded border px-3 py-2 text-sm disabled:opacity-50"
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
                            index === content.slideshowImages.length - 1 || saving
                          }
                          className="rounded border px-3 py-2 text-sm disabled:opacity-50"
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
                          className="rounded border border-red-200 px-3 py-2 text-sm text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="space-y-6 rounded-lg border p-6">
              <h2 className="text-xl font-semibold">About / Story Section</h2>

              <div>
                <label className="mb-1 block text-sm font-medium">Eyebrow</label>
                <input
                  className="w-full rounded border px-3 py-2 text-sm"
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
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                  className="w-full rounded border px-3 py-2 text-sm"
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
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  className="min-h-[140px] w-full rounded border px-3 py-2 text-sm"
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

              {[
                ['primaryButton', 'Primary CTA'],
                ['secondaryButton', 'Secondary CTA'],
              ].map(([key, label]) => {
                const buttonKey = key as 'primaryButton' | 'secondaryButton'
                const button = content.storySection[buttonKey]

                return (
                  <div key={buttonKey} className="rounded border p-4">
                    <h3 className="mb-4 font-medium">{label}</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Label</label>
                        <input
                          className="w-full rounded border px-3 py-2 text-sm"
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
                        <label className="mb-1 block text-sm font-medium">Link / Href</label>
                        <input
                          className="w-full rounded border px-3 py-2 text-sm"
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

            <section className="space-y-4 rounded-lg border p-6">
              <h2 className="text-xl font-semibold">Explore Intro</h2>

              <div>
                <label className="mb-1 block text-sm font-medium">Eyebrow</label>
                <input
                  className="w-full rounded border px-3 py-2 text-sm"
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
                <label className="mb-1 block text-sm font-medium">Title</label>
                <textarea
                  className="min-h-[100px] w-full rounded border px-3 py-2 text-sm"
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

            <section className="space-y-6 rounded-lg border p-6">
              <div>
                <h2 className="text-xl font-semibold">Partner Logos</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload, replace, remove, and reorder partner logos here.
                </p>
              </div>

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

              {content.partnerLogos.length > 0 ? (
                <div className="space-y-3">
                  {content.partnerLogos.map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="flex flex-col gap-3 rounded border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <img
                          src={imageUrl}
                          alt={`Partner logo ${index + 1}`}
                          className="h-14 w-24 rounded bg-white object-contain p-2"
                        />
                        <p className="truncate text-xs text-gray-500">{imageUrl}</p>
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
                          className="rounded border px-3 py-2 text-sm disabled:opacity-50"
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
                            index === content.partnerLogos.length - 1 || saving
                          }
                          className="rounded border px-3 py-2 text-sm disabled:opacity-50"
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
                          className="rounded border border-red-200 px-3 py-2 text-sm text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            {renderFeatureSectionEditor('weeklyFeature', 'Weekly Finds Feature', content.weeklyFeature)}
            {renderFeatureSectionEditor(
              'outfitsFeature',
              'Outfit Inspiration Feature',
              content.outfitsFeature
            )}
            {renderFeatureSectionEditor('articlesFeature', 'Articles Feature', content.articlesFeature)}

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
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