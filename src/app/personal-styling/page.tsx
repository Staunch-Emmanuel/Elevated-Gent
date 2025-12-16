'use client'

import { Container, PagePadding } from '@/components/layout'
import { PaymentForm } from '@/components/payment/PaymentForm'
import { useAuth } from '@/lib/firebase/auth'
import type { ServiceType } from '@/lib/stripe/client'

export default function PersonalStylingPage() {
  const { user } = useAuth()

  // IMPORTANT:
  // This MUST match a key in SERVICE_PRICES
  const serviceType: ServiceType = 'foundation-package'

  return (
    <PagePadding>
      <Container>
        <div className="max-w-3xl space-y-6">
          <h1 className="text-3xl font-bold">
            Personal Styling Session
          </h1>

          <p className="text-muted-foreground">
            Work one-on-one with a professional stylist to refine your look,
            build confidence, and upgrade your wardrobe with intention.
          </p>

          <ul className="list-disc pl-6 space-y-1">
            <li>Personalized outfit guidance</li>
            <li>Everyday and occasion looks</li>
            <li>Post-session recommendations</li>
          </ul>

          {user ? (
            <PaymentForm
              serviceType={serviceType}
              onSuccess={() => {
                window.location.href = '/payment/success'
              }}
              onCancel={() => {
                window.location.href = '/'
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Please sign in to book this service.
            </p>
          )}
        </div>
      </Container>
    </PagePadding>
  )
}
