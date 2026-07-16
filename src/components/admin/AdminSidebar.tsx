'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menu = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Homepage', href: '/admin/homepage' },
  { label: 'Auth Page Media', href: '/admin/auth-media' },
  { label: 'Articles', href: '/admin/articles' },
  { label: 'Weekly', href: '/admin/weekly' },
  { label: 'Wellness', href: '/admin/wellness' },
  { label: 'Outfits', href: '/admin/outfits' },
  { label: 'Personal Styling', href: '/admin/personal-styling' },
  { label: 'Users', href: '/admin/users' },
]

export default function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="min-h-screen w-64 shrink-0 border-r border-[#68634f] bg-[#77725d] px-5 py-7 text-[#f8f1e5] shadow-[10px_0_30px_rgba(36,35,29,0.10)]">
      <div className="mb-8 border-b border-[rgba(248,241,229,0.24)] pb-7">
        <h2 className="font-editorial text-3xl font-normal leading-tight tracking-[-0.03em] text-[#f8f1e5]">
          Admin Dashboard
        </h2>
      </div>

      <nav className="space-y-2">
        {menu.map((item) => {
          const active =
            path === item.href || path.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block border px-4 py-3 font-serif text-sm transition-colors duration-200 ${
                active
                  ? 'border-[#f8f1e5] bg-[#f8f1e5] font-semibold text-[#4f4b3b] shadow-[0_8px_20px_rgba(36,35,29,0.12)]'
                  : 'border-transparent text-[rgba(248,241,229,0.92)] hover:border-[rgba(248,241,229,0.34)] hover:bg-[rgba(248,241,229,0.10)] hover:text-[#f8f1e5]'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}