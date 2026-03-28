'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { PagePadding, Container } from '@/components/layout'
import { SOCIAL_LINKS } from '@/lib/constants'

const footerLinks = {
  services: [
    { name: 'All Services', href: '/personal-styling' },
    { name: 'Personal Styling', href: '/personal-styling#consultation' },
    { name: 'Wardrobe Consultation', href: '/personal-styling#audit' },
  ],
  collections: [
    { name: 'Outfit Inspiration', href: '/outfit-inspiration' },
    { name: 'Weekly Finds', href: '/weekly' },
    { name: 'Wellness Articles', href: '/wellness' },
  ],
  company: [
    { name: 'Contact Us', href: 'mailto:theelevatedgentlemann@gmail.com' },
    { name: 'Privacy Policy', href: '/privacy' },
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
    } catch {
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

      {/* Main Footer */}
      <section className="py-16">
        <PagePadding>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

              {/* Brand */}
              <div className="lg:col-span-2 space-y-6">
                <Link href="https://theelevatedgentleman.com">
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
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-white hover:text-black transition"
                    >
                      {social.icon === 'Instagram' && (
                        <svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18">
                          <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.5-.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/>
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-sm font-semibold uppercase mb-4">Services</h3>
                <ul className="space-y-2">
                  {footerLinks.services.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-gray-300 hover:text-white text-sm">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Collections */}
              <div>
                <h3 className="text-sm font-semibold uppercase mb-4">Collections</h3>
                <ul className="space-y-2">
                  {footerLinks.collections.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-gray-300 hover:text-white text-sm">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold uppercase mb-4">Company</h3>
                <ul className="space-y-2">

                  {/* ✅ MAILTO FIX */}
                  <li>
                    <a
                      href="mailto:theelevatedgentlemann@gmail.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Contact Us
                    </a>
                  </li>

                  <li>
                    <Link href="/privacy" className="text-gray-300 hover:text-white text-sm">
                      Privacy Policy
                    </Link>
                  </li>

                </ul>
              </div>

            </div>
          </Container>
        </PagePadding>
      </section>

      {/* Bottom */}
      <section className="py-6 border-t border-gray-800">
        <PagePadding>
          <Container>
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>© {new Date().getFullYear()} The Elevated Gentleman</span>
              <span>Built with passion for style</span>
            </div>
          </Container>
        </PagePadding>
      </section>
    </footer>
  )
}

export default Footer