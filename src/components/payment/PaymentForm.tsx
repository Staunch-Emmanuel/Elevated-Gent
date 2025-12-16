'use client'

import { useEffect, useState, useCallback } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise, SERVICE_PRICES, ServiceType } from '@/lib/stripe/client'
import { Button } from '@/components/ui'
import { useAuth } from '@/lib/firebase/auth'

interface PaymentFormProps {
  serviceType: ServiceType
  onSuccess: () => void
  onCancel: () => void
}

function CheckoutForm({ serviceType, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const service = SERVICE_PRICES[serviceType]

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment')
      } else {
        onSuccess()
      }
    } catch {
      setErrorMessage('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 border border-gray-200 rounded-lg">
      <div className="mb-6">
        <h3 className="text-xl font-semibold font-sans mb-2">{service.name}</h3>
        <p className="text-gray-600 font-serif text-sm mb-4">{service.description}</p>
        <div className="text-2xl font-semibold mb-4">${(service.price / 100).toFixed(2)}</div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm font-serif">
            💡 After completing your payment, you&apos;ll be able to access the full site immediately.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement />

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-serif">{errorMessage}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!stripe || isProcessing} className="flex-1">
            {isProcessing ? 'Processing...' : `Pay $${(service.price / 100).toFixed(2)}`}
          </Button>
        </div>
      </form>
    </div>
  )
}

export function PaymentForm({ serviceType, onSuccess, onCancel }: PaymentFormProps) {
  const { user } = useAuth()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  const initializePayment = useCallback(async () => {
    if (clientSecret) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType,
          customerEmail: user?.email || null,
          firebaseUid: user?.uid || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to initialize payment')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch {
      setError('Failed to initialize payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [clientSecret, serviceType, user?.email, user?.uid])

  useEffect(() => {
    if (!clientSecret && !loading && !error) {
      initializePayment()
    }
  }, [clientSecret, loading, error, initializePayment])

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 border border-gray-200 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-serif">Initializing payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 border border-gray-200 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-serif mb-4">{error}</p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={initializePayment} className="flex-1">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!clientSecret) return null

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#000000',
        colorBackground: '#ffffff',
        colorText: '#000000',
        fontFamily: 'system-ui, sans-serif',
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <CheckoutForm serviceType={serviceType} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  )
}
