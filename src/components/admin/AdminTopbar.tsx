'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const publicLinks = [
  { label: 'Home', href: '/home' },
  { label: 'Personal-styling', href: '/personal-styling' },
  { label: 'Articles', href: '/articles' },
  { label: 'Weekly Finds', href: '/weekly' },
  { label: 'Outfit Inspiration', href: '/outfit-inspiration' },
  { label: 'Wellness', href: '/wellness' },
  { label: 'Account', href: '/account' },
]

export default function AdminTopbar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === href

    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  return (
    <header className="border-b border-[rgba(232,235,236,0.22)] bg-[#817E6C] text-[#E8EBEC] shadow-[0_8px_24px_rgba(36,35,29,0.12)]">
      <div className="flex flex-col gap-5 px-7 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <p className="mb-1 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(232,235,236,0.72)]">
            Elevated Gentleman Admin
          </p>

          <h1 className="font-editorial text-2xl font-normal leading-tight tracking-[-0.02em] text-[#E8EBEC]">
            Manage content and jump back to the live site
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {publicLinks.map((link) => {
            const active = isActive(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.07em] transition-colors duration-200 ${
                  active
                    ? 'border-[#E8EBEC] bg-[#E8EBEC] text-[#817E6C]'
                    : 'border-[rgba(232,235,236,0.42)] bg-transparent text-[#E8EBEC] hover:border-[#E8EBEC] hover:bg-[#E8EBEC] hover:text-[#817E6C]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}