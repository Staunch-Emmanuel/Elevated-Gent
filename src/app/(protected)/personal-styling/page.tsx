'use client'

import { useEffect, useMemo, useState } from 'react'

import { PagePadding, Container } from '@/components/layout'
import { Button, Label } from '@/components/ui'
import { useAuth } from '@/lib/firebase/auth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

import { BookingForm } from '@/components/booking/BookingForm'
import { BookingSuccess } from '@/components/booking/BookingSuccess'
import { PaymentForm } from '@/components/payment/PaymentForm'

import type { ServiceType } from '@/lib/stripe/client'
import { StructuredData } from '@/components/seo/StructuredData'

import {
  defaultPersonalStylingContent,
  getPersonalStylingContent,
  type PersonalStylingContent,
} from '@/lib/firebase/personalStyling'

function replaceFirstName(template: string, firstName: string) {
  return template.replaceAll('{firstName}', firstName || 'there')
}

export default function PersonalStylingPage() {
  const { user } = useAuth()

  const [content, setContent] = useState<PersonalStylingContent>(
    defaultPersonalStylingContent
  )
  const [loadingContent, setLoadingContent] = useState(true)

  const [showBooking, setShowBooking] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedService, setSelectedService] = useState<string>('')

  const PREFERRED_FLOW: 'BOOKING_FIRST' | 'PAYMENT_FIRST' = 'PAYMENT_FIRST'

  useEffect(() => {
    async function load() {
      try {
        const data = await getPersonalStylingContent()
        setContent(data)
      } catch (error) {
        console.error(error)
        setContent(defaultPersonalStylingContent)
      } finally {
        setLoadingContent(false)
      }
    }

    void load()
  }, [])

  const firstName = useMemo(() => {
    return user?.displayName?.split(' ')[0] || 'there'
  }, [user])

  const heroTitle = useMemo(() => {
    return replaceFirstName(content.heroTitle, firstName)
  }, [content.heroTitle, firstName])

  const handleSelectPackage = (serviceType: ServiceType) => {
    setSelectedService(serviceType)

    if (PREFERRED_FLOW === 'PAYMENT_FIRST') {
      setShowPayment(true)
    } else {
      setShowBooking(true)
    }
  }

  const handleBookingSuccess = () => {
    setShowBooking(false)
    setShowSuccess(true)
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    setShowSuccess(true)
  }

  const handleBookingCancel = () => {
    setShowBooking(false)
    setSelectedService('')
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
    setSelectedService('')
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    setSelectedService('')
  }

  const handleBookYourSession = () => {
    const packagesSection = document.getElementById('packages-section')

    if (packagesSection) {
      packagesSection.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }

  const handleLearnMore = () => {
    const howItWorksSection = document.getElementById(
      'how-it-works-section'
    )

    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }

  return (
    <ProtectedRoute>
      <StructuredData pageKey="personal-styling" />

      <div className="min-h-screen bg-[var(--color-eg-espresso)] text-[var(--color-eg-cream)]">
        <section className="relative overflow-hidden border-b border-[var(--color-eg-line-light)] py-24 md:py-28 lg:py-32">
          {content.heroBackgroundImage ? (
            <>
              <div className="absolute inset-0">
                <img
                  src={content.heroBackgroundImage}
                  alt="Personal styling hero background"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,23,17,0.48)_0%,rgba(24,23,17,0.54)_48%,rgba(24,23,17,0.78)_100%)]" />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,23,17,0.04)_0%,rgba(24,23,17,0.44)_86%)]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[var(--color-eg-espresso-deep)]" />
          )}

          <PagePadding>
            <Container className="relative z-10">
              <div className="mx-auto max-w-5xl space-y-8 text-center">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.36em] text-[var(--color-text-muted)]">
                  Private Styling Services
                </p>

                <div className="overflow-hidden">
                  <h1 className="eg-editorial-heading text-[3.5rem] text-[var(--color-eg-cream)] sm:text-6xl md:text-7xl lg:text-[6.5rem]">
                    {heroTitle}
                  </h1>
                </div>

                <p className="mx-auto max-w-3xl font-serif text-lg leading-8 text-[var(--color-text-muted)] md:text-xl md:leading-9">
                  {content.heroSubtitle}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <Button
                    size="lg"
                    onClick={handleBookYourSession}
                    className="border border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] px-7 text-[var(--color-eg-espresso-deep)] shadow-[0_14px_38px_rgba(24,23,17,0.26)] transition hover:bg-transparent hover:text-[var(--color-eg-cream)]"
                  >
                    Book Your Session
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleLearnMore}
                    className="border-[rgba(232,235,236,0.72)] bg-[rgba(24,23,17,0.10)] px-7 text-[var(--color-eg-cream)] hover:border-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </Container>
          </PagePadding>
        </section>

        <section
          id="packages-section"
          className="border-b border-[var(--color-eg-line-light)] bg-[var(--color-eg-espresso)] py-20 md:py-24"
        >
          <PagePadding>
            <Container>
              <div className="mb-12 space-y-4 text-center md:mb-14">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--color-text-secondary)]">
                  Personal Styling
                </p>

                <h2 className="eg-editorial-heading text-5xl text-[var(--color-eg-cream)] md:text-6xl">
                  Choose Your Package
                </h2>
              </div>

              {loadingContent ? (
                <p className="text-center font-serif text-[var(--color-text-muted)]">
                  Loading...
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex h-full flex-col border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-7 text-[var(--color-eg-ink)] shadow-[0_18px_45px_rgba(24,23,17,0.12)] md:p-8">
                    <div className="mb-7 space-y-4">
                      <div className="h-6" />

                      <h3 className="font-editorial text-3xl font-normal leading-tight tracking-[-0.03em] text-[var(--color-eg-ink)]">
                        {content.foundationPackage.name}
                      </h3>

                      <p className="font-serif leading-7 text-[var(--color-eg-muted)]">
                        {content.foundationPackage.description}
                      </p>
                    </div>

                    <div className="flex-grow space-y-6">
                      <div className="text-3xl font-semibold text-[var(--color-eg-espresso-deep)]">
                        {content.foundationPackage.price}
                      </div>

                      <ul className="space-y-3 font-serif text-sm leading-6 text-[var(--color-eg-muted)]">
                        {content.foundationPackage.features.map(
                          (feature, index) => (
                            <li key={index}>• {feature}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <Button
                      className="mt-8 w-full border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]"
                      onClick={() =>
                        handleSelectPackage('foundation-package')
                      }
                    >
                      Book Package
                    </Button>
                  </div>

                  <div className="flex h-full flex-col border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-7 text-[var(--color-eg-ink)] shadow-[0_18px_45px_rgba(24,23,17,0.12)] md:p-8">
                    <div className="mb-7 space-y-4">
                      {content.signatureRefresh.badge ? (
                        <Label className="border-[var(--color-eg-espresso-deep)] text-[var(--color-eg-espresso-deep)]">
                          {content.signatureRefresh.badge}
                        </Label>
                      ) : (
                        <div className="h-6" />
                      )}

                      <h3 className="font-editorial text-3xl font-normal leading-tight tracking-[-0.03em] text-[var(--color-eg-ink)]">
                        {content.signatureRefresh.name}
                      </h3>

                      <p className="font-serif leading-7 text-[var(--color-eg-muted)]">
                        {content.signatureRefresh.description}
                      </p>
                    </div>

                    <div className="flex-grow space-y-6">
                      <div className="text-3xl font-semibold text-[var(--color-eg-espresso-deep)]">
                        {content.signatureRefresh.price}
                      </div>

                      <ul className="space-y-3 font-serif text-sm leading-6 text-[var(--color-eg-muted)]">
                        {content.signatureRefresh.features.map(
                          (feature, index) => (
                            <li key={index}>• {feature}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <Button
                      className="mt-8 w-full border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]"
                      onClick={() =>
                        handleSelectPackage('signature-refresh')
                      }
                    >
                      Book Package
                    </Button>
                  </div>

                  <div className="flex h-full flex-col border border-[rgba(232,235,236,0.38)] bg-[var(--color-eg-espresso-deep)] p-7 text-[var(--color-eg-cream)] shadow-[0_20px_50px_rgba(24,23,17,0.18)] md:p-8">
                    <div className="mb-7 space-y-4">
                      {content.gentlemensUpgrade.badge ? (
                        <Label
                          variant="inverse"
                          className="border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] text-[var(--color-eg-espresso-deep)]"
                        >
                          {content.gentlemensUpgrade.badge}
                        </Label>
                      ) : (
                        <div className="h-6" />
                      )}

                      <h3 className="font-editorial text-3xl font-normal leading-tight tracking-[-0.03em] text-[var(--color-eg-cream)]">
                        {content.gentlemensUpgrade.name}
                      </h3>

                      <p className="font-serif leading-7 text-[var(--color-text-muted)]">
                        {content.gentlemensUpgrade.description}
                      </p>
                    </div>

                    <div className="flex-grow space-y-6">
                      <div className="text-3xl font-semibold text-[var(--color-eg-cream)]">
                        {content.gentlemensUpgrade.price}
                      </div>

                      <ul className="space-y-3 font-serif text-sm leading-6 text-[var(--color-text-muted)]">
                        {content.gentlemensUpgrade.features.map(
                          (feature, index) => (
                            <li key={index}>• {feature}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <Button
                      className="mt-8 w-full border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] text-[var(--color-eg-espresso-deep)] hover:bg-transparent hover:text-[var(--color-eg-cream)]"
                      onClick={() =>
                        handleSelectPackage('gentlemens-upgrade')
                      }
                    >
                      Book Package
                    </Button>
                  </div>
                </div>
              )}
            </Container>
          </PagePadding>
        </section>

        <section
          id="how-it-works-section"
          className="border-b border-[var(--color-eg-line-light)] bg-[var(--color-eg-espresso-soft)] py-20 md:py-24"
        >
          <PagePadding>
            <Container>
              <div className="space-y-12 text-center md:space-y-14">
                <div className="mx-auto max-w-3xl space-y-4">
                  <p className="font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--color-text-secondary)]">
                    The Process
                  </p>

                  <h2 className="eg-editorial-heading text-5xl text-[var(--color-eg-cream)] md:text-6xl">
                    {content.processTitle}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {content.processSteps.map((step, index) => (
                    <div
                      key={index}
                      className="space-y-5 border border-[rgba(232,235,236,0.28)] bg-[rgba(232,235,236,0.06)] p-7 text-center backdrop-blur-[2px] md:p-8"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] text-xl font-semibold text-[var(--color-eg-espresso-deep)]">
                        {index + 1}
                      </div>

                      <h3 className="font-editorial text-2xl font-normal text-[var(--color-eg-cream)]">
                        {step.title}
                      </h3>

                      <p className="font-serif leading-7 text-[var(--color-text-muted)]">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Container>
          </PagePadding>
        </section>

        <section
          id="faq-section"
          className="bg-[var(--color-eg-espresso-deep)] py-20 md:py-24"
        >
          <PagePadding>
            <Container size="medium">
              <div className="space-y-12 text-center md:space-y-14">
                <div className="space-y-4">
                  <p className="font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--color-text-secondary)]">
                    Frequently Asked Questions
                  </p>

                  <h2 className="eg-editorial-heading text-5xl text-[var(--color-eg-cream)] md:text-6xl">
                    {content.faqTitle}
                  </h2>
                </div>

                <div className="space-y-8 text-left">
                  {content.faqs.map((faq, index) => (
                    <div key={index}>
                      <div className="space-y-4">
                        <h3 className="font-editorial text-2xl font-normal text-[var(--color-eg-cream)] md:text-3xl">
                          {faq.question}
                        </h3>

                        <p className="font-serif leading-7 text-[var(--color-text-muted)] md:leading-8">
                          {faq.answer}
                        </p>
                      </div>

                      {index < content.faqs.length - 1 ? (
                        <div className="mt-8 h-px bg-[var(--color-eg-line-light)]" />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </Container>
          </PagePadding>
        </section>

        {showBooking ? (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(24,23,17,0.76)] p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
              <BookingForm
                selectedService={selectedService}
                onSuccess={handleBookingSuccess}
                onCancel={handleBookingCancel}
              />
            </div>
          </div>
        ) : null}

        {showPayment && selectedService ? (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(24,23,17,0.76)] p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-6 text-[var(--color-eg-ink)] shadow-[0_24px_70px_rgba(24,23,17,0.30)] sm:p-8">
              <button
                type="button"
                onClick={handlePaymentCancel}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-eg-muted)] transition-colors duration-200 hover:bg-[rgba(36,35,29,0.08)] hover:text-[var(--color-eg-ink)]"
                aria-label="Close modal"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="mb-7 pr-10">
                <h2 className="mb-2 font-editorial text-3xl font-normal text-[var(--color-eg-ink)]">
                  Complete Your Booking
                </h2>

                <p className="font-serif text-[var(--color-eg-muted)]">
                  Secure payment processing powered by Stripe
                </p>
              </div>

              <PaymentForm
                serviceType={selectedService as ServiceType}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </div>
          </div>
        ) : null}

        {showSuccess ? (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(24,23,17,0.76)] p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg">
              <BookingSuccess onClose={handleSuccessClose} />
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  )
}