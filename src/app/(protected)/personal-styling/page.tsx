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

  const handleBookSession = (serviceType?: string) => {
    setSelectedService(serviceType || '')

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

  const handleLearnMore = () => {
    const faqSection = document.getElementById('faq-section')
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <ProtectedRoute>
      <StructuredData pageKey="personal-styling" />

      {/* HERO */}
      <section className="py-24 bg-[#E5E5E5]">
        <PagePadding>
          <Container>
            <div className="text-center space-y-8">
              <div className="overflow-hidden">
                <h1 className="text-6xl font-semibold font-sans leading-tight text-black">
                  {heroTitle}
                </h1>
              </div>

              <p className="text-xl font-serif text-black/80 max-w-3xl mx-auto leading-relaxed">
                {content.heroSubtitle}
              </p>

              <div className="pt-4 flex items-center justify-center gap-3 flex-wrap">
                <Button size="lg" onClick={() => handleBookSession('signature-refresh')}>
                  Book Your Session
                </Button>

                <Button size="lg" variant="outline" onClick={handleLearnMore}>
                  Learn More
                </Button>
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>

      {/* PACKAGES (UNCHANGED DESIGN) */}
      <section className="py-16">
        <PagePadding>
          <Container>
            {loadingContent ? (
              <p className="text-center">Loading...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* FOUNDATION */}
                <div className="border border-black p-8 flex flex-col h-full">
                  <div className="space-y-4 mb-6">
                    <div className="h-6" />
                    <h3 className="text-2xl font-semibold font-sans">
                      {content.foundationPackage.name}
                    </h3>
                    <p className="font-serif text-muted">
                      {content.foundationPackage.description}
                    </p>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div className="text-3xl font-semibold">
                      {content.foundationPackage.price}
                    </div>
                    <ul className="space-y-2 font-serif text-sm">
                      {content.foundationPackage.features.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full mt-6" onClick={() => handleBookSession('foundation-package')}>
                    Book Package
                  </Button>
                </div>

                {/* SIGNATURE */}
                <div className="border border-black p-8 flex flex-col h-full">
                  <div className="space-y-4 mb-6">
                    {content.signatureRefresh.badge ? (
                      <Label>{content.signatureRefresh.badge}</Label>
                    ) : (
                      <div className="h-6" />
                    )}

                    <h3 className="text-2xl font-semibold font-sans">
                      {content.signatureRefresh.name}
                    </h3>
                    <p className="font-serif text-muted">
                      {content.signatureRefresh.description}
                    </p>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div className="text-3xl font-semibold">
                      {content.signatureRefresh.price}
                    </div>
                    <ul className="space-y-2 font-serif text-sm">
                      {content.signatureRefresh.features.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full mt-6" onClick={() => handleBookSession('signature-refresh')}>
                    Book Package
                  </Button>
                </div>

                {/* PREMIUM */}
                <div className="border border-black p-8 bg-background-muted flex flex-col h-full">
                  <div className="space-y-4 mb-6">
                    {content.gentlemensUpgrade.badge ? (
                      <Label variant="inverse">{content.gentlemensUpgrade.badge}</Label>
                    ) : (
                      <div className="h-6" />
                    )}

                    <h3 className="text-2xl font-semibold font-sans">
                      {content.gentlemensUpgrade.name}
                    </h3>
                    <p className="font-serif text-muted">
                      {content.gentlemensUpgrade.description}
                    </p>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div className="text-3xl font-semibold">
                      {content.gentlemensUpgrade.price}
                    </div>
                    <ul className="space-y-2 font-serif text-sm">
                      {content.gentlemensUpgrade.features.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full mt-6" onClick={() => handleBookSession('gentlemens-upgrade')}>
                    Book Package
                  </Button>
                </div>

              </div>
            )}
          </Container>
        </PagePadding>
      </section>

      {/* PROCESS (UNCHANGED DESIGN) */}
      <section className="py-16 bg-background-muted">
        <PagePadding>
          <Container>
            <div className="text-center space-y-12">
              <h2 className="text-4xl font-semibold font-sans">
                {content.processTitle}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {content.processSteps.map((step, i) => (
                  <div key={i} className="text-center space-y-4">
                    <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-semibold mx-auto">
                      {i + 1}
                    </div>
                    <h3 className="text-xl font-semibold font-sans">{step.title}</h3>
                    <p className="font-serif text-muted">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>

      {/* FAQ (UNCHANGED DESIGN) */}
      <section id="faq-section" className="py-16">
        <PagePadding>
          <Container size="medium">
            <div className="text-center space-y-12">
              <h2 className="text-4xl font-semibold font-sans">
                {content.faqTitle}
              </h2>

              <div className="text-left space-y-8">
                {content.faqs.map((faq, i) => (
                  <div key={i}>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold font-sans">
                        {faq.question}
                      </h3>
                      <p className="font-serif text-muted">{faq.answer}</p>
                    </div>

                    {i < content.faqs.length - 1 && <div className="divider mt-8" />}
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>

      {/* MODALS (UNCHANGED) */}
      {showBooking && (
        <BookingForm
          selectedService={selectedService}
          onSuccess={handleBookingSuccess}
          onCancel={handleBookingCancel}
        />
      )}

      {showPayment && selectedService && (
        <PaymentForm
          serviceType={selectedService as ServiceType}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      {showSuccess && <BookingSuccess onClose={handleSuccessClose} />}
    </ProtectedRoute>
  )
}