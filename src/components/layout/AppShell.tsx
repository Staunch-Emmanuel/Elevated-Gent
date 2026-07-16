'use client'

import { usePathname } from 'next/navigation'

import Header from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <div className="page-wrapper min-h-screen bg-[var(--color-eg-espresso)] text-[var(--color-eg-cream)]">
      <Header />

      <main className="main-wrapper bg-[var(--color-eg-espresso)]">
        {children}
      </main>

      <Footer />
    </div>
  )
}