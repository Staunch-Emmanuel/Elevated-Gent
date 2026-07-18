'use client'

export default function SubscriptionBadge({
  status,
}: {
  status: string
}) {
  if (status !== 'active') return null

  return (
    <span className="inline-flex items-center rounded-full border border-[#9aaa83] bg-[#edf3e4] px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#40512f]">
      Subscription Active
    </span>
  )
}