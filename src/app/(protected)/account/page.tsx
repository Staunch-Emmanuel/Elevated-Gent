'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { PagePadding, Container } from '@/components/layout'
import { Button } from '@/components/ui'
import { useAuth } from '@/lib/firebase/auth'
import { ProfileEditModal } from '@/components/account/ProfileEditModal'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { getUserData } from '@/lib/firebase/getUserData'

import {
  getUserFavorites,
  removeFavorite,
  type FavoriteItem,
} from '@/lib/firebase/favorites'

type AccountUserData = {
  role?: string | null
  subscriptionStatus?: string | null
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
}

export default function AccountPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [accountData, setAccountData] =
    useState<AccountUserData | null>(null)
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  const [removingFavoriteId, setRemovingFavoriteId] = useState<
    string | null
  >(null)

  const signupSuccess = useMemo(() => {
    return searchParams.get('signup') === 'success'
  }, [searchParams])

  useEffect(() => {
    async function loadAccountData() {
      if (!user?.uid) {
        setLoadingSubscription(false)
        return
      }

      try {
        const data = await getUserData(user.uid)
        setAccountData(data as AccountUserData)
      } catch (error) {
        console.error('Failed to load account data:', error)
      } finally {
        setLoadingSubscription(false)
      }
    }

    void loadAccountData()
  }, [user?.uid])

  useEffect(() => {
    async function loadFavorites() {
      if (!user?.uid) {
        setFavorites([])
        setLoadingFavorites(false)
        return
      }

      try {
        const items = await getUserFavorites(user.uid)
        setFavorites(items)
      } catch (error) {
        console.error('Failed to load favorites:', error)
        setFavorites([])
      } finally {
        setLoadingFavorites(false)
      }
    }

    void loadFavorites()
  }, [user?.uid])

  const handleBookSession = () => {
    router.push('/personal-styling')
  }

  const handleViewCollections = () => {
    router.push('/outfit-inspiration')
  }

  const handleLearnMore = () => {
    router.push('/personal-styling')
  }

  const handleEditProfile = () => {
    setShowEditProfile(true)
  }

  const handleWeeklyFinds = () => {
    router.push('/weekly')
  }

  const handleSubscribe = () => {
    router.push('/subscribe')
  }

  const handleSignOut = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleRemoveFavorite = async (favorite: FavoriteItem) => {
    if (!user?.uid) return

    setRemovingFavoriteId(favorite.id)

    try {
      await removeFavorite(
        user.uid,
        favorite.type,
        favorite.contentId
      )

      setFavorites((items) =>
        items.filter((item) => item.id !== favorite.id)
      )
    } catch (error) {
      console.error('Remove favorite error:', error)
      alert('Unable to remove saved item. Please try again.')
    } finally {
      setRemovingFavoriteId(null)
    }
  }

  const handleManageSubscription = async () => {
    if (!user) return

    setPortalLoading(true)

    try {
      const token = await user.getIdToken()

      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to open subscription portal'
        )
      }

      if (!data?.url) {
        throw new Error(
          'No customer portal URL returned'
        )
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Customer portal error:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'Unable to open subscription portal'
      )

      setPortalLoading(false)
    }
  }

  const subscriptionStatusLabel = useMemo(() => {
    const status = accountData?.subscriptionStatus

    if (status === 'active') return 'Active'
    if (status === 'past_due') return 'Past Due'
    if (status === 'inactive') return 'Inactive'

    return 'Not Active'
  }, [accountData?.subscriptionStatus])

  const hasActiveSubscription =
    accountData?.subscriptionStatus === 'active'

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--color-eg-espresso)] text-[var(--color-eg-cream)]">
        <section className="border-b border-[var(--color-eg-line-light)] bg-[var(--color-eg-espresso-deep)] py-20 md:py-24">
          <PagePadding>
            <Container>
              <div className="mx-auto max-w-4xl space-y-7 text-center">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-[var(--color-text-secondary)]">
                  Member Profile
                </p>

                <div className="overflow-hidden">
                  <h1 className="eg-editorial-heading text-5xl text-[var(--color-eg-cream)] sm:text-6xl md:text-7xl">
                    Your Account
                  </h1>
                </div>

                <p className="mx-auto max-w-2xl font-serif text-lg leading-8 text-[var(--color-text-muted)] md:text-xl md:leading-9">
                  Manage your profile, styling sessions,
                  and curated collections.
                </p>
              </div>
            </Container>
          </PagePadding>
        </section>

        {signupSuccess ? (
          <section className="bg-[var(--color-eg-espresso)] pb-2 pt-10">
            <PagePadding>
              <Container>
                <div className="mx-auto max-w-3xl space-y-5 border border-[#aebc98] bg-[#eef3e7] p-7 text-center text-[#26321d] shadow-[0_16px_40px_rgba(24,23,17,0.10)]">
                  <h2 className="font-editorial text-3xl font-normal">
                    Account created successfully
                  </h2>

                  <p className="font-serif leading-7">
                    Your account is ready. Subscribe now
                    to unlock access to the platform and
                    protected content.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button onClick={handleSubscribe}>
                      Subscribe Now
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleViewCollections}
                    >
                      Explore the Platform
                    </Button>
                  </div>
                </div>
              </Container>
            </PagePadding>
          </section>
        ) : null}

        <section className="bg-[var(--color-eg-espresso)] py-16 md:py-20 lg:py-24">
          <PagePadding>
            <Container>
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                <div className="space-y-7 border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-7 text-[var(--color-eg-ink)] shadow-[0_18px_45px_rgba(24,23,17,0.11)] md:p-8">
                  <div className="border-b border-[var(--color-eg-line)] pb-5">
                    <h3 className="font-editorial text-3xl font-normal">
                      Profile Information
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-espresso-deep)]">
                        Name
                      </label>

                      <p className="font-serif text-lg text-[var(--color-eg-ink)]">
                        {user?.displayName ||
                          'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-espresso-deep)]">
                        Email
                      </label>

                      <p className="break-words font-serif text-lg text-[var(--color-eg-ink)]">
                        {user?.email}
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-espresso-deep)]">
                        Member Since
                      </label>

                      <p className="font-serif text-lg text-[var(--color-eg-ink)]">
                        {user?.metadata?.creationTime
                          ? new Date(
                              user.metadata.creationTime
                            ).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )
                          : 'Recently joined'}
                      </p>
                    </div>

                    <div className="border-t border-[var(--color-eg-line)] pt-5">
                      <label className="mb-3 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-espresso-deep)]">
                        Style Preferences
                      </label>

                      <div className="space-y-2">
                        <p className="font-serif text-sm leading-6 text-[var(--color-eg-muted)]">
                          • Casual Style: Not set
                        </p>

                        <p className="font-serif text-sm leading-6 text-[var(--color-eg-muted)]">
                          • Work Style: Not set
                        </p>

                        <p className="font-serif text-sm leading-6 text-[var(--color-eg-muted)]">
                          • Budget Range: Not set
                        </p>

                        <p className="mt-3 font-serif text-xs font-semibold text-[var(--color-eg-espresso-deep)]">
                          Click &quot;Edit Profile&quot; to
                          set your preferences
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-[var(--color-eg-line)] pt-6">
                    <Button
                      variant="outline"
                      className="w-full border-[var(--color-eg-espresso-deep)] text-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]"
                      onClick={handleEditProfile}
                    >
                      Edit Profile
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-[#a94e45] text-[#913a32] hover:bg-[#913a32] hover:text-white"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>

                <div className="space-y-7 border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-7 text-[var(--color-eg-ink)] shadow-[0_18px_45px_rgba(24,23,17,0.11)] md:p-8">
                  <div className="border-b border-[var(--color-eg-line)] pb-5">
                    <h3 className="font-editorial text-3xl font-normal">
                      Subscription & Access
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div className="border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] p-6">
                      <div className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-espresso-deep)]">
                        Current Status
                      </div>

                      {loadingSubscription ? (
                        <p className="font-serif text-sm text-[var(--color-eg-muted)]">
                          Loading subscription details...
                        </p>
                      ) : (
                        <>
                          <div className="font-sans text-xl font-semibold text-[var(--color-eg-ink)]">
                            {subscriptionStatusLabel}
                          </div>

                          <p className="mt-3 font-serif text-sm leading-7 text-[var(--color-eg-muted)]">
                            {hasActiveSubscription
                              ? 'Your subscription is active and your account should have access to protected content.'
                              : 'Your subscription is not currently active. Subscribe to restore full access.'}
                          </p>
                        </>
                      )}
                    </div>

                    {hasActiveSubscription ? (
                      <Button
                        className="w-full border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]"
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                      >
                        {portalLoading
                          ? 'Opening Subscription Portal...'
                          : 'Manage / Cancel Subscription'}
                      </Button>
                    ) : (
                      <Button
                        className="w-full border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]"
                        onClick={handleSubscribe}
                      >
                        Subscribe Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-7 border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-7 text-[var(--color-eg-ink)] shadow-[0_18px_45px_rgba(24,23,17,0.11)] md:mt-12 md:p-8">
                <div className="flex flex-col gap-5 border-b border-[var(--color-eg-line)] pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="font-editorial text-3xl font-normal">
                      Saved Favorites
                    </h3>

                    <p className="mt-2 max-w-xl font-serif text-sm leading-6 text-[var(--color-eg-muted)]">
                      Outfits and items you save will
                      appear here for quick access.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleWeeklyFinds}
                      className="border-[var(--color-eg-espresso-deep)] text-[var(--color-eg-espresso-deep)] hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]"
                    >
                      Browse Weekly Finds
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleViewCollections}
                      className="border-[var(--color-eg-espresso-deep)] bg-[var(--color-eg-espresso-deep)] text-[var(--color-eg-cream)] hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]"
                    >
                      Browse Outfits
                    </Button>
                  </div>
                </div>

                {loadingFavorites ? (
                  <p className="font-serif text-sm text-[var(--color-eg-muted)]">
                    Loading saved favorites...
                  </p>
                ) : favorites.length === 0 ? (
                  <div className="border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] p-8 text-center">
                    <h4 className="mb-2 font-editorial text-2xl font-normal">
                      No saved favorites yet
                    </h4>

                    <p className="font-serif text-sm leading-6 text-[var(--color-eg-muted)]">
                      Save outfits or weekly items as you
                      browse, then return here anytime.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((favorite) => {
                      const targetHref =
                        favorite.href ||
                        (favorite.type === 'outfit'
                          ? `/outfit-inspiration/${favorite.contentId}`
                          : favorite.externalUrl ||
                            '/weekly')

                      return (
                        <div
                          key={favorite.id}
                          className="flex h-full flex-col overflow-hidden border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] shadow-[0_10px_28px_rgba(24,23,17,0.07)]"
                        >
                          <div className="relative aspect-[4/3] bg-[var(--color-eg-paper-soft)]">
                            {favorite.imageUrl ? (
                              <Image
                                src={favorite.imageUrl}
                                alt={favorite.title}
                                fill
                                className="object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="flex flex-1 flex-col space-y-4 p-5">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-eg-espresso-deep)]">
                                {favorite.type ===
                                'outfit'
                                  ? 'Outfit'
                                  : 'Item'}
                              </span>

                              {favorite.category ? (
                                <span className="font-serif text-xs text-[var(--color-eg-muted)]">
                                  {favorite.category}
                                </span>
                              ) : null}
                            </div>

                            <div>
                              {favorite.brand ? (
                                <p className="mb-1 font-serif text-xs uppercase tracking-[0.14em] text-[var(--color-eg-muted)]">
                                  {favorite.brand}
                                </p>
                              ) : null}

                              <h4 className="font-editorial text-2xl font-normal leading-tight">
                                {favorite.title}
                              </h4>

                              {favorite.price ? (
                                <p className="mt-2 text-sm font-semibold text-[var(--color-eg-espresso-deep)]">
                                  {favorite.price}
                                </p>
                              ) : null}
                            </div>

                            {favorite.description ? (
                              <p className="line-clamp-2 flex-1 font-serif text-sm leading-6 text-[var(--color-eg-muted)]">
                                {favorite.description}
                              </p>
                            ) : null}

                            <div className="flex gap-3 border-t border-[var(--color-eg-line)] pt-4">
                              {targetHref.startsWith(
                                'http'
                              ) ? (
                                <a
                                  href={targetHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 border border-[var(--color-eg-espresso-deep)] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] transition-colors hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]"
                                >
                                  Open
                                </a>
                              ) : (
                                <Link
                                  href={targetHref}
                                  className="flex-1 border border-[var(--color-eg-espresso-deep)] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] transition-colors hover:bg-[var(--color-eg-espresso-deep)] hover:text-[var(--color-eg-cream)]"
                                >
                                  Open
                                </Link>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleRemoveFavorite(
                                    favorite
                                  )
                                }
                                disabled={
                                  removingFavoriteId ===
                                  favorite.id
                                }
                                className="border-[var(--color-eg-line)] text-[var(--color-eg-muted)] hover:border-[#913a32] hover:bg-[#913a32] hover:text-white"
                              >
                                {removingFavoriteId ===
                                favorite.id
                                  ? 'Removing...'
                                  : 'Remove'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="mt-10 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex h-full flex-col border border-[var(--color-eg-line-light)] bg-[rgba(248,241,229,0.06)] p-6 text-center">
                  <h4 className="mb-2 font-editorial text-2xl font-normal text-[var(--color-eg-cream)]">
                    Browse Collections
                  </h4>

                  <p className="mb-5 flex-1 font-serif text-sm leading-6 text-[var(--color-text-muted)]">
                    Explore our curated affiliate
                    collections
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewCollections}
                    className="border-[var(--color-eg-cream)] text-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]"
                  >
                    View Collections
                  </Button>
                </div>

                <div className="flex h-full flex-col border border-[var(--color-eg-line-light)] bg-[rgba(248,241,229,0.06)] p-6 text-center">
                  <h4 className="mb-2 font-editorial text-2xl font-normal text-[var(--color-eg-cream)]">
                    Weekly Finds
                  </h4>

                  <p className="mb-5 flex-1 font-serif text-sm leading-6 text-[var(--color-text-muted)]">
                    Discover this week&apos;s best fashion
                    picks
                  </p>

                  <Button
                    size="sm"
                    onClick={handleWeeklyFinds}
                    className="border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] text-[var(--color-eg-espresso-deep)] hover:bg-transparent hover:text-[var(--color-eg-cream)]"
                  >
                    Browse Finds
                  </Button>
                </div>

                <div className="flex h-full flex-col border border-[var(--color-eg-line-light)] bg-[rgba(248,241,229,0.06)] p-6 text-center">
                  <h4 className="mb-2 font-editorial text-2xl font-normal text-[var(--color-eg-cream)]">
                    Style Consultation
                  </h4>

                  <p className="mb-5 flex-1 font-serif text-sm leading-6 text-[var(--color-text-muted)]">
                    Book a 1:1 styling session
                  </p>

                  <Button
                    size="sm"
                    onClick={handleBookSession}
                    className="border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] text-[var(--color-eg-espresso-deep)] hover:bg-transparent hover:text-[var(--color-eg-cream)]"
                  >
                    Book Now
                  </Button>
                </div>

                <div className="flex h-full flex-col border border-[var(--color-eg-line-light)] bg-[rgba(248,241,229,0.06)] p-6 text-center">
                  <h4 className="mb-2 font-editorial text-2xl font-normal text-[var(--color-eg-cream)]">
                    Wardrobe Audit
                  </h4>

                  <p className="mb-5 flex-1 font-serif text-sm leading-6 text-[var(--color-text-muted)]">
                    Optimize your existing wardrobe
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLearnMore}
                    className="border-[var(--color-eg-cream)] text-[var(--color-eg-cream)] hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </Container>
          </PagePadding>
        </section>

        <ProfileEditModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />
      </div>
    </ProtectedRoute>
  )
}