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
    <aside className="min-h-screen w-64 shrink-0 border-r border-[#817E6C] bg-[#817E6C] px-5 py-7 text-[#E8EBEC] shadow-[10px_0_30px_rgba(36,35,29,0.10)]">
      <div className="mb-8 border-b border-[rgba(232,235,236,0.24)] pb-7">
        <h2 className="font-editorial text-3xl font-normal leading-tight tracking-[-0.03em] text-[#E8EBEC]">
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
                  ? 'border-[#E8EBEC] bg-[#E8EBEC] font-semibold text-[#817E6C] shadow-[0_8px_20px_rgba(36,35,29,0.12)]'
                  : 'border-transparent text-[rgba(232,235,236,0.92)] hover:border-[rgba(232,235,236,0.34)] hover:bg-[rgba(232,235,236,0.10)] hover:text-[#E8EBEC]'
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