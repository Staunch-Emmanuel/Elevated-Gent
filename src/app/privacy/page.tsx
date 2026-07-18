'use client'

import { PagePadding, Container } from '@/components/layout'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-eg-paper)] text-[var(--color-eg-ink)]">
      {/* Hero Section */}
      <section className="border-b border-[var(--color-eg-line-light)] bg-[var(--color-eg-espresso-deep)] py-20 text-[var(--color-eg-cream)] md:py-24">
        <PagePadding>
          <Container>
            <div className="mx-auto max-w-4xl space-y-7 text-center">
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--color-text-secondary)]">
                Legal Information
              </p>

              <div className="overflow-hidden px-2 sm:px-4">
                <h1 className="eg-editorial-heading text-5xl text-[var(--color-eg-cream)] sm:text-6xl md:text-7xl lg:text-8xl">
                  PRIVACY POLICY
                </h1>
              </div>

              <p className="mx-auto max-w-3xl px-2 font-serif text-lg leading-8 text-[var(--color-text-muted)] sm:px-4 md:text-xl md:leading-9">
                Your privacy is important to us. This policy outlines how we
                collect, use, and protect your information.
              </p>
            </div>
          </Container>
        </PagePadding>
      </section>

      {/* Privacy Policy Content */}
      <section className="bg-[var(--color-eg-paper)] py-16 md:py-20 lg:py-24">
        <PagePadding>
          <Container size="medium">
            <div className="space-y-10 border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-6 shadow-[0_18px_50px_rgba(24,23,17,0.08)] sm:p-8 md:p-12">
              <div className="border-b border-[var(--color-eg-line)] pb-8">
                <h2 className="mb-4 font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  1. Information We Collect
                </h2>

                <div className="space-y-4 font-serif leading-8 text-[var(--color-eg-muted)]">
                  <p>
                    We collect information you provide directly to us, such as
                    when you:
                  </p>

                  <ul className="ml-5 list-disc space-y-2">
                    <li>Create an account</li>
                    <li>Book styling services</li>
                    <li>Make purchases through our affiliate links</li>
                    <li>Contact us for support</li>
                    <li>Subscribe to our communications</li>
                  </ul>

                  <p>
                    This may include your name, email address, phone number,
                    payment information, and styling preferences.
                  </p>
                </div>
              </div>

              <div className="border-b border-[var(--color-eg-line)] pb-8">
                <h2 className="mb-4 font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  2. How We Use Your Information
                </h2>

                <div className="space-y-4 font-serif leading-8 text-[var(--color-eg-muted)]">
                  <p>We use the information we collect to:</p>

                  <ul className="ml-5 list-disc space-y-2">
                    <li>Provide and improve our styling services</li>
                    <li>Process payments and fulfill orders</li>
                    <li>
                      Send you service updates and promotional materials
                    </li>
                    <li>
                      Respond to your inquiries and provide customer support
                    </li>
                    <li>Analyze usage patterns to enhance our platform</li>
                  </ul>
                </div>
              </div>

              <div className="border-b border-[var(--color-eg-line)] pb-8">
                <h2 className="mb-4 font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  3. Information Sharing
                </h2>

                <div className="space-y-4 font-serif leading-8 text-[var(--color-eg-muted)]">
                  <p>
                    We may share your information in the following
                    circumstances:
                  </p>

                  <ul className="ml-5 list-disc space-y-2">
                    <li>
                      With service providers who assist in our operations
                    </li>
                    <li>When required by law or to protect our rights</li>
                    <li>In connection with a business transaction</li>
                    <li>With your consent or at your direction</li>
                  </ul>

                  <p>
                    We do not sell your personal information to third parties.
                  </p>
                </div>
              </div>

              <div className="border-b border-[var(--color-eg-line)] pb-8">
                <h2 className="mb-4 font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  4. Data Security
                </h2>

                <div className="space-y-4 font-serif leading-8 text-[var(--color-eg-muted)]">
                  <p>
                    We implement appropriate technical and organizational
                    measures to protect your personal information against
                    unauthorized access, alteration, disclosure, or destruction.
                  </p>

                  <p>
                    However, no method of transmission over the internet or
                    electronic storage is completely secure, so we cannot
                    guarantee absolute security.
                  </p>
                </div>
              </div>

              <div className="border-b border-[var(--color-eg-line)] pb-8">
                <h2 className="mb-4 font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  5. Your Rights
                </h2>

                <div className="space-y-4 font-serif leading-8 text-[var(--color-eg-muted)]">
                  <p>You have the right to:</p>

                  <ul className="ml-5 list-disc space-y-2">
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Withdraw consent where applicable</li>
                  </ul>
                </div>
              </div>

              <div className="border-b border-[var(--color-eg-line)] pb-8">
                <h2 className="mb-4 font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  6. Cookies and Tracking
                </h2>

                <div className="space-y-4 font-serif leading-8 text-[var(--color-eg-muted)]">
                  <p>
                    We use cookies and similar technologies to enhance your
                    experience, analyze usage, and provide personalized content.
                    You can control cookie settings through your browser
                    preferences.
                  </p>
                </div>
              </div>

              <div className="border-b border-[var(--color-eg-line)] pb-8">
                <h2 className="mb-4 font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  7. Third-Party Links
                </h2>

                <div className="space-y-4 font-serif leading-8 text-[var(--color-eg-muted)]">
                  <p>
                    Our service may contain links to third-party websites. We
                    are not responsible for the privacy practices of these
                    external sites and encourage you to review their privacy
                    policies.
                  </p>
                </div>
              </div>

              <div className="border-b border-[var(--color-eg-line)] pb-8">
                <h2 className="mb-4 font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  8. Children&apos;s Privacy
                </h2>

                <div className="space-y-4 font-serif leading-8 text-[var(--color-eg-muted)]">
                  <p>
                    Our services are not intended for children under 18. We do
                    not knowingly collect personal information from children
                    under 18.
                  </p>
                </div>
              </div>

              <div className="border-b border-[var(--color-eg-line)] pb-8">
                <h2 className="mb-4 font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  9. Changes to This Policy
                </h2>

                <div className="space-y-4 font-serif leading-8 text-[var(--color-eg-muted)]">
                  <p>
                    We may update this privacy policy from time to time. We will
                    notify you of any changes by posting the new policy on this
                    page and updating the effective date.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="mb-4 font-editorial text-3xl font-normal text-[var(--color-eg-ink)] md:text-4xl">
                  10. Contact Us
                </h2>

                <div className="space-y-5 font-serif leading-8 text-[var(--color-eg-muted)]">
                  <p>
                    If you have any questions about this privacy policy or our
                    practices, please contact us at:
                  </p>

                  <div className="border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] p-6">
                    <p className="font-sans font-semibold text-[var(--color-eg-ink)]">
                      The Elevated Gentleman
                    </p>

                    <p>Email: privacy@theelevatedgentleman.com</p>

                    <p>Last Updated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </PagePadding>
      </section>
    </div>
  )
}