'use client'

import { useEffect, useState, FormEvent } from 'react'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { PagePadding, Container } from '@/components/layout'
import CMSImageUploadField from '@/components/admin/CMSImageUploadField'

import {
  defaultPersonalStylingContent,
  getPersonalStylingContent,
  savePersonalStylingContent,
  type PersonalStylingContent,
} from '@/lib/firebase/personalStyling'

function updateFeature(
  content: PersonalStylingContent,
  packageKey: 'foundationPackage' | 'signatureRefresh' | 'gentlemensUpgrade',
  index: number,
  value: string
): PersonalStylingContent {
  const nextFeatures = [...content[packageKey].features]
  nextFeatures[index] = value

  return {
    ...content,
    [packageKey]: {
      ...content[packageKey],
      features: nextFeatures,
    },
  }
}

function addFeature(
  content: PersonalStylingContent,
  packageKey: 'foundationPackage' | 'signatureRefresh' | 'gentlemensUpgrade'
): PersonalStylingContent {
  return {
    ...content,
    [packageKey]: {
      ...content[packageKey],
      features: [...content[packageKey].features, ''],
    },
  }
}

function removeFeature(
  content: PersonalStylingContent,
  packageKey: 'foundationPackage' | 'signatureRefresh' | 'gentlemensUpgrade',
  index: number
): PersonalStylingContent {
  const filtered = content[packageKey].features.filter((_, i) => i !== index)

  return {
    ...content,
    [packageKey]: {
      ...content[packageKey],
      features: filtered.length > 0 ? filtered : [''],
    },
  }
}

function updateProcessStep(
  content: PersonalStylingContent,
  index: number,
  field: 'title' | 'description',
  value: string
): PersonalStylingContent {
  const nextSteps = [...content.processSteps]
  nextSteps[index] = {
    ...nextSteps[index],
    [field]: value,
  }

  return {
    ...content,
    processSteps: nextSteps,
  }
}

function updateFaq(
  content: PersonalStylingContent,
  index: number,
  field: 'question' | 'answer',
  value: string
): PersonalStylingContent {
  const nextFaqs = [...content.faqs]
  nextFaqs[index] = {
    ...nextFaqs[index],
    [field]: value,
  }

  return {
    ...content,
    faqs: nextFaqs,
  }
}

function addFaq(content: PersonalStylingContent): PersonalStylingContent {
  return {
    ...content,
    faqs: [...content.faqs, { question: '', answer: '' }],
  }
}

function removeFaq(
  content: PersonalStylingContent,
  index: number
): PersonalStylingContent {
  const nextFaqs = content.faqs.filter((_, i) => i !== index)

  return {
    ...content,
    faqs: nextFaqs.length > 0 ? nextFaqs : [{ question: '', answer: '' }],
  }
}

export default function AdminPersonalStylingPage() {
  const [content, setContent] = useState<PersonalStylingContent>(
    defaultPersonalStylingContent
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getPersonalStylingContent()
        setContent(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load personal styling content.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await savePersonalStylingContent(content)
      setMessage('Personal styling page updated successfully.')
    } catch (err) {
      console.error(err)
      setError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <PagePadding>
          <Container className="py-10">
            <div className="border border-[#c8bcaa] bg-[#f2eadf] px-6 py-12 text-center shadow-[0_12px_32px_rgba(36,35,29,0.06)]">
              <p className="font-serif text-[#575348]">
                Loading personal styling content...
              </p>
            </div>
          </Container>
        </PagePadding>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PagePadding>
        <Container className="max-w-5xl py-10 md:py-12">
          <div className="mb-8 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_16px_42px_rgba(36,35,29,0.07)] sm:p-8">
            <h1 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[#24231d]">
              Personal Styling
            </h1>

            <p className="mt-3 max-w-3xl font-serif text-sm leading-6 text-[#575348]">
              Edit the personal styling page content here. Use{' '}
              <span className="font-mono text-[#4f4b3b]">
                {'{firstName}'}
              </span>{' '}
              in the hero title if you want the user&apos;s first name to
              appear dynamically.
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
            <section className="space-y-5 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                Hero Section
              </h2>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                  Hero Title
                </label>

                <input
                  className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                  value={content.heroTitle}
                  onChange={(e) =>
                    setContent({ ...content, heroTitle: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                  Hero Subtitle
                </label>

                <textarea
                  className="min-h-[120px] w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                  value={content.heroSubtitle}
                  onChange={(e) =>
                    setContent({ ...content, heroSubtitle: e.target.value })
                  }
                />
              </div>

              <div className="border border-[#d2c6b5] bg-[#e9dfd1] p-5">
                <CMSImageUploadField
                  label="Hero Background Image"
                  folder="homepage"
                  documentSlug="personal-styling-hero"
                  mode="single"
                  value={content.heroBackgroundImage}
                  onChange={(value) =>
                    setContent({
                      ...content,
                      heroBackgroundImage:
                        typeof value === 'string' ? value : '',
                    })
                  }
                  helpText="This image will replace the flat grey hero background and display with a dark overlay."
                  disabled={saving}
                />
              </div>
            </section>

            {[
              ['foundationPackage', 'Foundation Package'],
              ['signatureRefresh', 'Signature Refresh'],
              ['gentlemensUpgrade', "Gentlemen's Upgrade"],
            ].map(([key, label]) => {
              const packageKey = key as
                | 'foundationPackage'
                | 'signatureRefresh'
                | 'gentlemensUpgrade'

              const pkg = content[packageKey]

              return (
                <section
                  key={packageKey}
                  className="space-y-5 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]"
                >
                  <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                    {label}
                  </h2>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                        Name
                      </label>

                      <input
                        className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                        value={pkg.name}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            [packageKey]: {
                              ...pkg,
                              name: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                        Price
                      </label>

                      <input
                        className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                        value={pkg.price}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            [packageKey]: {
                              ...pkg,
                              price: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                      Description
                    </label>

                    <textarea
                      className="min-h-[120px] w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                      value={pkg.description}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          [packageKey]: {
                            ...pkg,
                            description: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                        Badge (optional)
                      </label>

                      <input
                        className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                        value={pkg.badge ?? ''}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            [packageKey]: {
                              ...pkg,
                              badge: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                        Badge Variant
                      </label>

                      <select
                        className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none hover:border-[#77725d] focus:border-[#4f4b3b]"
                        value={pkg.badgeVariant ?? 'default'}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            [packageKey]: {
                              ...pkg,
                              badgeVariant:
                                e.target.value === 'inverse'
                                  ? 'inverse'
                                  : 'default',
                            },
                          })
                        }
                      >
                        <option value="default">default</option>
                        <option value="inverse">inverse</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 border border-[#d2c6b5] bg-[#e9dfd1] p-5">
                    <label className="block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                      Features
                    </label>

                    {pkg.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-3 sm:flex-row"
                      >
                        <input
                          className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                          value={feature}
                          onChange={(e) =>
                            setContent(
                              updateFeature(
                                content,
                                packageKey,
                                index,
                                e.target.value
                              )
                            )
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setContent(
                              removeFeature(content, packageKey, index)
                            )
                          }
                          className="border border-[#a65a50] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#f8f1e5]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setContent(addFeature(content, packageKey))
                      }
                      className="font-serif text-sm font-semibold text-[#4f4b3b] underline underline-offset-4 transition-colors hover:text-[#24231d]"
                    >
                      + Add feature
                    </button>
                  </div>
                </section>
              )
            })}

            <section className="space-y-5 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                Process Section
              </h2>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                  Section Title
                </label>

                <input
                  className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                  value={content.processTitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      processTitle: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-5">
                {content.processSteps.map((step, index) => (
                  <div
                    key={index}
                    className="space-y-4 border border-[#d2c6b5] bg-[#e9dfd1] p-5"
                  >
                    <h3 className="font-editorial text-xl font-normal text-[#24231d]">
                      Step {index + 1}
                    </h3>

                    <div>
                      <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#4f4b3b]">
                        Title
                      </label>

                      <input
                        className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                        value={step.title}
                        onChange={(e) =>
                          setContent(
                            updateProcessStep(
                              content,
                              index,
                              'title',
                              e.target.value
                            )
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#4f4b3b]">
                        Description
                      </label>

                      <textarea
                        className="min-h-[110px] w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                        value={step.description}
                        onChange={(e) =>
                          setContent(
                            updateProcessStep(
                              content,
                              index,
                              'description',
                              e.target.value
                            )
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-5 border border-[#c8bcaa] bg-[#f2eadf] p-6 shadow-[0_12px_32px_rgba(36,35,29,0.05)]">
              <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
                FAQ Section
              </h2>

              <div>
                <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
                  Section Title
                </label>

                <input
                  className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                  value={content.faqTitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      faqTitle: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-5">
                {content.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="space-y-4 border border-[#d2c6b5] bg-[#e9dfd1] p-5"
                  >
                    <div>
                      <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#4f4b3b]">
                        Question
                      </label>

                      <input
                        className="min-h-12 w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                        value={faq.question}
                        onChange={(e) =>
                          setContent(
                            updateFaq(
                              content,
                              index,
                              'question',
                              e.target.value
                            )
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#4f4b3b]">
                        Answer
                      </label>

                      <textarea
                        className="min-h-[130px] w-full border border-[#b9ae9d] bg-[#f8f1e5] px-4 py-3 font-serif text-sm leading-6 text-[#24231d] outline-none placeholder:text-[#6b675b] placeholder:opacity-100 hover:border-[#77725d] focus:border-[#4f4b3b]"
                        value={faq.answer}
                        onChange={(e) =>
                          setContent(
                            updateFaq(
                              content,
                              index,
                              'answer',
                              e.target.value
                            )
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setContent(removeFaq(content, index))
                      }
                      className="border border-[#a65a50] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#f8f1e5]"
                    >
                      Remove FAQ
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setContent(addFaq(content))}
                className="font-serif text-sm font-semibold text-[#4f4b3b] underline underline-offset-4 transition-colors hover:text-[#24231d]"
              >
                + Add FAQ
              </button>
            </section>

            <div className="sticky bottom-4 z-20 border border-[#c8bcaa] bg-[rgba(242,234,223,0.96)] p-4 shadow-[0_16px_42px_rgba(36,35,29,0.16)] backdrop-blur-xl">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center border border-[#4f4b3b] bg-[#4f4b3b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f1e5] transition-colors hover:bg-transparent hover:text-[#4f4b3b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Personal Styling Page'}
              </button>
            </div>
          </form>
        </Container>
      </PagePadding>
    </ProtectedRoute>
  )
}