import SubscriptionGate from '@/components/auth/SubscriptionGate'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SubscriptionGate>{children}</SubscriptionGate>
}
