'use client'

export default function SubscriptionBadge({
  status,
}: {
  status: string
}) {
  if (status !== "active") return null;

  return (
    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
      Subscription Active
    </span>
  );
}
