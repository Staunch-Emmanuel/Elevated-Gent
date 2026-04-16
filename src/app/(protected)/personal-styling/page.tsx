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

  const [content, setContent] = useState<PersonalStylingContent>(defaultPersonalStylingContent)
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
      } catch (err) {
        console.error(err)
        setContent(defaultPersonalStylingContent)
      } finally {
        setLoadingContent(false)
      }
    }

    load()
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
      packagesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLearnMore = () => {
    const howItWorksSection = document.getElementById('how-it-works-section')
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <ProtectedRoute>
      <StructuredData pageKey="personal-styling" />

      <section className="relative overflow-hidden py-24">
        {content.heroBackgroundImage ? (
          <>
            <div className="absolute inset-0">
              <img
                src={content.heroBackgroundImage}
                alt="Personal styling hero background"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.45)_45%,rgba(0,0,0,0.5)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.3)_85%)]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#E5E5E5]" />
        )}

        <PagePadding>
          <Container className="relative z-10">
            <div className="space-y-8 text-center">
              <div className="overflow-hidden">
                <h1
                  className={`font-sans text-5xl font-semibold leading-tight md:text-6xl ${
                    content.heroBackgroundImage ? 'text-white' : 'text-black'
                  }`}
                >
                  {heroTitle}
                </h1>
              </div>

              <p
                className={`mx-auto max-w-3xl font-serif text-xl leading-relaxed ${
                  content.heroBackgroundImage ? 'text-white/85' : 'text-black/80'
                }`}
              >
                {content.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button size="lg" onClick={handleBookYourSession}>
                  Book Your Session
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleLearnMore}
                  className={
                    content.heroBackgroundImage
                      ? 'border-white bg-transparent text-white hover:bg-white hover:text-black'
                      : undefined
                  }
                >
                  Learn More
                </Button>
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>

      <section id="packages-section" className="py-16">
        <PagePadding>
          <Container>
            {loadingContent ? (
              <p className="text-center">Loading...</p>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex h-full flex-col border border-black p-8">
                  <div className="mb-6 space-y-4">
                    <div className="h-6" />
                    <h3 className="font-sans text-2xl font-semibold">
                      {content.foundationPackage.name}
                    </h3>
                    <p className="font-serif text-muted">
                      {content.foundationPackage.description}
                    </p>
                  </div>

                  <div className="flex-grow space-y-4">
                    <div className="text-3xl font-semibold">
                      {content.foundationPackage.price}
                    </div>
                    <ul className="space-y-2 font-serif text-sm">
                      {content.foundationPackage.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="mt-6 w-full"
                    onClick={() => handleSelectPackage('foundation-package')}
                  >
                    Book Package
                  </Button>
                </div>

                <div className="flex h-full flex-col border border-black p-8">
                  <div className="mb-6 space-y-4">
                    {content.signatureRefresh.badge ? (
                      <Label>{content.signatureRefresh.badge}</Label>
                    ) : (
                      <div className="h-6" />
                    )}

                    <h3 className="font-sans text-2xl font-semibold">
                      {content.signatureRefresh.name}
                    </h3>
                    <p className="font-serif text-muted">
                      {content.signatureRefresh.description}
                    </p>
                  </div>

                  <div className="flex-grow space-y-4">
                    <div className="text-3xl font-semibold">
                      {content.signatureRefresh.price}
                    </div>
                    <ul className="space-y-2 font-serif text-sm">
                      {content.signatureRefresh.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="mt-6 w-full"
                    onClick={() => handleSelectPackage('signature-refresh')}
                  >
                    Book Package
                  </Button>
                </div>

                <div className="bg-background-muted flex h-full flex-col border border-black p-8">
                  <div className="mb-6 space-y-4">
                    {content.gentlemensUpgrade.badge ? (
                      <Label variant="inverse">{content.gentlemensUpgrade.badge}</Label>
                    ) : (
                      <div className="h-6" />
                    )}

                    <h3 className="font-sans text-2xl font-semibold">
                      {content.gentlemensUpgrade.name}
                    </h3>
                    <p className="font-serif text-muted">
                      {content.gentlemensUpgrade.description}
                    </p>
                  </div>

                  <div className="flex-grow space-y-4">
                    <div className="text-3xl font-semibold">
                      {content.gentlemensUpgrade.price}
                    </div>
                    <ul className="space-y-2 font-serif text-sm">
                      {content.gentlemensUpgrade.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="mt-6 w-full"
                    onClick={() => handleSelectPackage('gentlemens-upgrade')}
                  >
                    Book Package
                  </Button>
                </div>
              </div>
            )}
          </Container>
        </PagePadding>
      </section>

      <section id="how-it-works-section" className="bg-background-muted py-16">
        <PagePadding>
          <Container>
            <div className="space-y-12 text-center">
              <h2 className="font-sans text-4xl font-semibold">
                {content.processTitle}
              </h2>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {content.processSteps.map((step, index) => (
                  <div key={index} className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl font-semibold text-white">
                      {index + 1}
                    </div>
                    <h3 className="font-sans text-xl font-semibold">{step.title}</h3>
                    <p className="font-serif text-muted">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>

      <section id="faq-section" className="py-16">
        <PagePadding>
          <Container size="medium">
            <div className="space-y-12 text-center">
              <h2 className="font-sans text-4xl font-semibold">
                {content.faqTitle}
              </h2>

              <div className="space-y-8 text-left">
                {content.faqs.map((faq, index) => (
                  <div key={index}>
                    <div className="space-y-4">
                      <h3 className="font-sans text-xl font-semibold">
                        {faq.question}
                      </h3>
                      <p className="font-serif text-muted">{faq.answer}</p>
                    </div>

                    {index < content.faqs.length - 1 ? <div className="divider mt-8" /> : null}
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>

      {showBooking && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <BookingForm
              selectedService={selectedService}
              onSuccess={handleBookingSuccess}
              onCancel={handleBookingCancel}
            />
          </div>
        </div>
      )}

      {showPayment && selectedService && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-8">
            <button
              onClick={handlePaymentCancel}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h2 className="mb-2 font-sans text-2xl font-semibold">Complete Your Booking</h2>
              <p className="font-serif text-gray-600">Secure payment processing powered by Stripe</p>
            </div>

            <PaymentForm
              serviceType={selectedService as ServiceType}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg">
            <BookingSuccess onClose={handleSuccessClose} />
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}