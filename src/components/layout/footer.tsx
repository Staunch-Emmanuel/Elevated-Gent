'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui'
import { PagePadding, Container } from '@/components/layout'
import { SOCIAL_LINKS } from '@/lib/constants'

const footerLinks = {
  services: [
    {
      name: 'All Services',
      href: '/personal-styling',
    },
    {
      name: 'Personal Styling',
      href: '/personal-styling#consultation',
    },
    {
      name: 'Wardrobe Consultation',
      href: '/personal-styling#audit',
    },
  ],
  collections: [
    {
      name: 'Outfit Inspiration',
      href: '/outfit-inspiration',
    },
    {
      name: 'Weekly Finds',
      href: '/weekly',
    },
    {
      name: 'Wellness Articles',
      href: '/wellness',
    },
  ],
  company: [
    {
      name: 'Contact Us',
      href: 'mailto:theelevatedgentlemann@gmail.com',
    },
    {
      name: 'Privacy Policy',
      href: '/privacy',
    },
  ],
}

function InstagramIcon() {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.5-.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" />
    </svg>
  )
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] =
    useState(false)

  const [subscriptionStatus, setSubscriptionStatus] =
    useState<'idle' | 'success' | 'error'>('idle')

  const handleNewsletterSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault()

    if (!email) return

    setIsSubscribing(true)
    setSubscriptionStatus('idle')

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      )

      setSubscriptionStatus('success')
      setEmail('')

      setTimeout(() => {
        setSubscriptionStatus('idle')
      }, 3000)
    } catch {
      setSubscriptionStatus('error')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <footer className="bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)]">
      <section className="border-b border-[var(--color-eg-line-light)] py-16 md:py-20">
        <PagePadding>
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="eg-editorial-heading mb-5 text-4xl text-[var(--color-eg-cream)] sm:text-5xl md:text-6xl">
                Stay Elevated
              </h2>

              <p className="mx-auto mb-8 max-w-2xl font-serif text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg">
                Get weekly style tips, exclusive offers,
                and early access to new collections. Join
                the community of discerning gentlemen.
              </p>

              <form
                onSubmit={handleNewsletterSubmit}
                className="mx-auto max-w-xl"
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter your email"
                    required
                    className="min-w-0 flex-1 border border-[rgba(248,241,229,0.5)] bg-[rgba(248,241,229,0.07)] px-5 py-3.5 font-serif text-[var(--color-eg-cream)] outline-none transition-colors placeholder:text-[rgba(248,241,229,0.62)] focus:border-[var(--color-eg-cream)] focus:bg-[rgba(248,241,229,0.1)]"
                  />

                  <Button
                    type="submit"
                    disabled={isSubscribing}
                    variant="inverse"
                    className="border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] px-8 text-[var(--color-eg-espresso-deep)] hover:bg-transparent hover:text-[var(--color-eg-cream)]"
                  >
                    {isSubscribing
                      ? 'Joining...'
                      : 'Join'}
                  </Button>
                </div>

                {subscriptionStatus === 'success' ? (
                  <p className="mt-3 font-serif text-sm text-[#e4efd7]">
                    Welcome to The Elevated Gentleman!
                    Check your email for confirmation.
                  </p>
                ) : null}

                {subscriptionStatus === 'error' ? (
                  <p className="mt-3 font-serif text-sm text-[#f5cfc7]">
                    Something went wrong. Please try
                    again.
                  </p>
                ) : null}
              </form>
            </div>
          </Container>
        </PagePadding>
      </section>

      <section className="py-14 md:py-16">
        <PagePadding>
          <Container>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-10 lg:grid-cols-5 lg:gap-x-12">
              <div className="space-y-6 lg:col-span-2">
                <Link href="/home" className="inline-block">
                  <Image
                    src="/images/The Elevated gentleman.svg"
                    alt="The Elevated Gentleman"
                    width={250}
                    height={15}
                    className="h-4 w-auto brightness-0 invert"
                  />
                </Link>

                <p className="max-w-sm font-serif text-sm leading-7 text-[var(--color-text-muted)]">
                  Classic styling for the modern man.
                  Professional consultation services and
                  curated collections for the discerning
                  gentleman.
                </p>

                <div className="flex gap-3">
                  {SOCIAL_LINKS.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(248,241,229,0.4)] text-[var(--color-eg-cream)] transition-colors duration-200 hover:border-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]"
                      aria-label={social.name}
                    >
                      {social.icon === 'Instagram' ? (
                        <InstagramIcon />
                      ) : null}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-cream)]">
                  Services
                </h3>

                <ul className="space-y-3">
                  {footerLinks.services.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="font-serif text-sm text-[var(--color-text-muted)] transition-colors duration-200 hover:text-[var(--color-eg-cream)]"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-cream)]">
                  Collections
                </h3>

                <ul className="space-y-3">
                  {footerLinks.collections.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="font-serif text-sm text-[var(--color-text-muted)] transition-colors duration-200 hover:text-[var(--color-eg-cream)]"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-cream)]">
                  Company
                </h3>

                <ul className="space-y-3">
                  <li>
                    <a
                      href="mailto:theelevatedgentlemann@gmail.com"
                      target="_blank"
                      rel="noreferrer"
                      className="font-serif text-sm text-[var(--color-text-muted)] transition-colors duration-200 hover:text-[var(--color-eg-cream)]"
                    >
                      Contact Us
                    </a>
                  </li>

                  <li>
                    <Link
                      href="/privacy"
                      className="font-serif text-sm text-[var(--color-text-muted)] transition-colors duration-200 hover:text-[var(--color-eg-cream)]"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>

      <section className="border-t border-[var(--color-eg-line-light)] py-6">
        <PagePadding>
          <Container>
            <div className="flex flex-col items-center justify-between gap-2 text-center font-serif text-xs tracking-[0.02em] text-[var(--color-text-secondary)] sm:flex-row sm:text-left sm:text-sm">
              <span>
                © {new Date().getFullYear()} The Elevated
                Gentleman
              </span>

              <span>
                Built with passion for style
              </span>
            </div>
          </Container>
        </PagePadding>
      </section>
    </footer>
  )
}

export default Footer