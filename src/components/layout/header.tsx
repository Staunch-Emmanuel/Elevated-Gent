'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NAVIGATION_LINKS, SOCIAL_LINKS } from '@/lib/constants'
import { PagePadding, Container } from '@/components/layout'
import { useAuth } from '@/lib/firebase/auth'
import { Button } from '@/components/ui'

export function Header() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="relative">
      {/* Main Navbar */}
      <div className="relative z-[1000]">
        <PagePadding>
          <Container>
            <nav className="relative z-2 flex items-center justify-between pt-6 md:pt-12 pb-6">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="https://theelevatedgentleman.com" className="inline-block">
                  {/* Full logo for mobile */}
                  <Image
                    src="/images/The Elevated gentleman.svg"
                    alt="The Elevated Gentleman"
                    width={330}
                    height={19}
                    className="h-4 w-auto md:hidden"
                  />
                  {/* Short logo for tablet */}
                  <Image
                    src="/EG.svg"
                    alt="The Elevated Gentleman"
                    width={50}
                    height={50}
                    className="hidden md:block lg:hidden h-8 w-auto"
                  />
                  {/* Full logo for desktop */}
                  <Image
                    src="/images/The Elevated gentleman.svg"
                    alt="The Elevated Gentleman"
                    width={330}
                    height={19}
                    className="hidden lg:block h-5 w-auto"
                  />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center justify-end">
                <div className="flex items-center gap-2 md:gap-3 lg:gap-6 pl-2 md:pl-3 lg:pl-6">
                  {/* Menu Links - Only show when user is authenticated */}
                  {user && (
                    <>
                      <div className="z-1 flex items-center justify-center gap-2 md:gap-3 lg:gap-6">
                        {NAVIGATION_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="group relative h-7 overflow-hidden text-decoration-none transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer whitespace-nowrap"
                          >
                            <div className="font-serif text-sm md:text-base lg:text-xl block">
                              {link.name}
                            </div>
                            <div className="font-serif text-sm md:text-base lg:text-xl block">
                              {link.name}
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Menu Border */}
                      <div className="w-[8px] md:w-[10px] lg:w-[15px] h-px bg-black" />
                    </>
                  )}

                  {/* Social Links */}
                  <div className="z-1 flex items-center justify-center gap-4">
                    {SOCIAL_LINKS.map((social) => (
                      <div key={social.name} className="w-5 h-5">
                        <Link
                          href={social.href}
                          target="_blank"
                          className="inline-block transition-all duration-300 ease-in-out hover:scale-125 hover:text-gray-600 cursor-pointer"
                        >
                          <div className="w-5 h-5 flex">
                            {social.icon === 'Instagram' && (
                              <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 0 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4c-2.474 0-2.878.007-4.029.058-.784.037-1.31.142-1.798.332-.434.168-.747.369-1.08.703a2.89 2.89 0 0 0-.704 1.08c-.19.49-.295 1.015-.331 1.798C4.006 9.075 4 9.461 4 12c0 2.474.007 2.878.058 4.029.037.783.142 1.31.331 1.797.17.435.37.748.702 1.08.337.336.65.537 1.08.703.494.191 1.02.297 1.8.333C9.075 19.994 9.461 20 12 20c2.474 0 2.878-.007 4.029-.058.782-.037 1.309-.142 1.797-.331.433-.169.748-.37 1.08-.702.337-.337.538-.65.704-1.08.19-.493.296-1.02.332-1.8.052-1.104.058-1.49.058-4.029 0-2.474-.007-2.878-.058-4.029-.037-.782-.142-1.31-.332-1.798a2.911 2.911 0 0 0-.703-1.08 2.884 2.884 0 0 0-1.08-.704c-.49-.19-1.016-.295-1.798-.331C14.925 4.006 14.539 4 12 4zm0-2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z"></path>
                              </svg>
                            )}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* User Menu */}
                  {user && (
                    <div className="ml-2 md:ml-3 lg:ml-6 flex items-center gap-1 md:gap-2 lg:gap-4">
                      <span className="hidden lg:block text-sm font-serif text-gray-600 truncate max-w-none">
                        {user.displayName || user.email}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="text-[10px] md:text-xs lg:text-sm whitespace-nowrap px-2 md:px-3"
                      >
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <div className="md:hidden flex items-center gap-4">
                {/* Social Links for Mobile */}
                <div className="flex items-center gap-3">
                  {SOCIAL_LINKS.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      className="w-4 h-4 transition-all duration-300 ease-in-out hover:scale-125 hover:text-gray-600 cursor-pointer"
                    >
                      {social.icon === 'Instagram' && (
                        <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 0 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4c-2.474 0-2.878.007-4.029.058-.784.037-1.31.142-1.798.332-.434.168-.747.369-1.08.703a2.89 2.89 0 0 0-.704 1.08c-.19.49-.295 1.015-.331 1.798C4.006 9.075 4 9.461 4 12c0 2.474.007 2.878.058 4.029.037.783.142 1.31.331 1.797.17.435.37.748.702 1.08.337.336.65.537 1.08.703.494.191 1.02.297 1.8.333C9.075 19.994 9.461 20 12 20c2.474 0 2.878-.007 4.029-.058.782-.037 1.309-.142 1.797-.331.433-.169.748-.37 1.08-.702.337-.337.538-.65.704-1.08.19-.493.296-1.02.332-1.8.052-1.104.058-1.49.058-4.029 0-2.474-.007-2.878-.058-4.029-.037-.782-.142-1.31-.332-1.798a2.911 2.911 0 0 0-.703-1.08 2.884 2.884 0 0 0-1.08-.704c-.49-.19-1.016-.295-1.798-.331C14.925 4.006 14.539 4 12 4zm0-2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z"></path>
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Enhanced Hamburger Menu */}
                {user && (
                  <button
                    onClick={toggleMobileMenu}
                    className="relative w-10 h-10 flex flex-col justify-center items-center transition-all duration-300 ease-in-out cursor-pointer group"
                    aria-label="Toggle mobile menu"
                  >
                    <div className="w-6 h-5 relative flex flex-col justify-between">
                      <span className={`w-full h-0.5 bg-black transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : 'group-hover:w-5'}`}></span>
                      <span className={`w-full h-0.5 bg-black transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'group-hover:w-4'}`}></span>
                      <span className={`w-full h-0.5 bg-black transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : 'group-hover:w-5'}`}></span>
                    </div>
                  </button>
                )}
              </div>
            </nav>

            {/* Divider Line */}
            <div className="divider" />
          </Container>
        </PagePadding>
      </div>

      {/* Enhanced Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-[1100] transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-50' : 'opacity-0'}`}
          onClick={closeMobileMenu}
        />

        {/* Menu Panel */}
        <div className={`absolute top-0 right-0 h-full w-80 max-w-[80vw] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {user && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold font-sans">
                      {user.displayName || 'Welcome'}
                    </div>
                    <div className="text-xs text-gray-500 font-serif">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-6 space-y-2">
                {NAVIGATION_LINKS.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="group block p-4 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-50 cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-lg group-hover:text-black transition-colors">
                        {link.name}
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </nav>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-200 space-y-4">
                {/* Social Links */}
                <div className="flex items-center justify-center gap-4">
                  {SOCIAL_LINKS.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-black hover:text-white transition-all duration-200"
                    >
                      {social.icon === 'Instagram' && (
                        <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 0 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4c-2.474 0-2.878.007-4.029.058-.784.037-1.31.142-1.798.332-.434.168-.747.369-1.08.703a2.89 2.89 0 0 0-.704 1.08c-.19.49-.295 1.015-.331 1.798C4.006 9.075 4 9.461 4 12c0 2.474.007 2.878.058 4.029.037.783.142 1.31.331 1.797.17.435.37.748.702 1.08.337.336.65.537 1.08.703.494.191 1.02.297 1.8.333C9.075 19.994 9.461 20 12 20c2.474 0 2.878-.007 4.029-.058.782-.037 1.309-.142 1.797-.331.433-.169.748-.37 1.08-.702.337-.337.538-.65.704-1.08.19-.493.296-1.02.332-1.8.052-1.104.058-1.49.058-4.029 0-2.474-.007-2.878-.058-4.029-.037-.782-.142-1.31-.332-1.798a2.911 2.911 0 0 0-.703-1.08 2.884 2.884 0 0 0-1.08-.704c-.49-.19-1.016-.295-1.798-.331C14.925 4.006 14.539 4 12 4zm0-2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z"></path>
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-sticky-placeholder" />
      <div className="mobile-menu-overlay" />
    </header>
  )
}

export default Header
