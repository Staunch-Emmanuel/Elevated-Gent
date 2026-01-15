import SubscriptionGate from '@/components/auth/SubscriptionGate'

export default function AccountPage() {
  return (
    <SubscriptionGate>
      ...account content...
    </SubscriptionGate>
  )
}
