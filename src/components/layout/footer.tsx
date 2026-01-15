'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { PagePadding, Container } from '@/components/layout'
import { NAVIGATION_LINKS, SOCIAL_LINKS, APP_CONFIG } from '@/lib/constants'

const footerLinks = {
  services: [
    { name: 'Personal Styling', href: '/personal-styling' },
  ],
  collections: [
    { name: 'Articles', href: '/articles' },
    { name: 'Wellness', href: '/wellness' },
    { name: 'Weekly Finds', href: '/weekly' },
    { name: 'Outfit Inspiration', href: '/outfit-inspiration' },
  ],
  company: [
    { name: 'Account', href: '/account' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Contact Us', href: 'mailto:Markkoob@outlook.com' },
  ],
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubscribing(true)
    setSubscriptionStatus('idle')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubscriptionStatus('success')
      setEmail('')
      setTimeout(() => setSubscriptionStatus('idle'), 3000)
    } catch (error) {
      setSubscriptionStatus('error')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <footer className="bg-black text-white">
      {/* Newsletter Section */}
      <section className="py-16 border-b border-gray-800">
        <PagePadding>
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-semibold font-sans mb-4">
                Stay Elevated
              </h2>
              <p className="text-lg font-serif text-gray-300 mb-8 max-w-2xl mx-auto">
                Get weekly style tips, exclusive offers, and early access to new collections.
                Join the community of discerning gentlemen.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400 font-serif"
                  />
                  <Button
                    type="submit"
                    disabled={isSubscribing}
                    variant="inverse"
                    className="px-6"
                  >
                    {isSubscribing ? 'Joining...' : 'Join'}
                  </Button>
                </div>

                {subscriptionStatus === 'success' && (
                  <p className="text-green-400 text-sm font-serif mt-2">
                    Welcome to The Elevated Gentleman! Check your email for confirmation.
                  </p>
                )}

                {subscriptionStatus === 'error' && (
                  <p className="text-red-400 text-sm font-serif mt-2">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            </div>
          </Container>
        </PagePadding>
      </section>

      {/* Main Footer Content */}
      <section className="py-16">
        <PagePadding>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Brand Section */}
              <div className="lg:col-span-2 space-y-6">
                <Link href="https://theelevatedgentleman.com" className="inline-block">
                  <Image
                    src="/images/The Elevated gentleman.svg"
                    alt="The Elevated Gentleman"
                    width={250}
                    height={15}
                    className="h-4 w-auto filter invert"
                  />
                </Link>

                <p className="font-serif text-gray-300 text-sm leading-relaxed max-w-sm">
                  Classic styling for the modern man. Professional consultation services
                  and curated collections for the discerning gentleman.
                </p>

                <div className="flex gap-4">
                  {SOCIAL_LINKS.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-white hover:text-black transition-all duration-200"
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
              </div>

              {/* Services Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold font-sans uppercase tracking-wider">
                  Services
                </h3>
                <ul className="space-y-2">
                  {footerLinks.services.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors font-serif text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Collections Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold font-sans uppercase tracking-wider">
                  Collections
                </h3>
                <ul className="space-y-2">
                  {footerLinks.collections.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors font-serif text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold font-sans uppercase tracking-wider">
                  Company
                </h3>
                <ul className="space-y-2">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors font-serif text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </Container>
        </PagePadding>
      </section>

      {/* Bottom Bar */}
      <section className="py-6 border-t border-gray-800">
        <PagePadding>
          <Container>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-sm font-serif">
                © {new Date().getFullYear()} The Elevated Gentleman. All rights reserved.
              </div>

              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-400 text-sm font-serif">
                  Built with passion for style and excellence
                </span>
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>
    </footer>
  )
}
