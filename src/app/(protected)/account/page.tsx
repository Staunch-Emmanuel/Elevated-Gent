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
  const [accountData, setAccountData] = useState<AccountUserData | null>(null)
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [removingFavoriteId, setRemovingFavoriteId] = useState<string | null>(null)

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

    loadAccountData()
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

    loadFavorites()
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
      await removeFavorite(user.uid, favorite.type, favorite.contentId)
      setFavorites((items) => items.filter((item) => item.id !== favorite.id))
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
        throw new Error(data?.error || 'Unable to open subscription portal')
      }

      if (!data?.url) {
        throw new Error('No customer portal URL returned')
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

  const hasActiveSubscription = accountData?.subscriptionStatus === 'active'

  return (
    <ProtectedRoute>
      <>
        <section className="py-16">
          <PagePadding>
            <Container>
              <div className="text-center space-y-8">
                <div className="overflow-hidden">
                  <h1 className="text-6xl font-semibold font-sans leading-tight">
                    Your Account
                  </h1>
                </div>
                <p className="text-xl font-serif text-muted max-w-2xl mx-auto">
                  Manage your profile, styling sessions, and curated collections.
                </p>
              </div>
            </Container>
          </PagePadding>
        </section>

        {signupSuccess ? (
          <section className="pb-4">
            <PagePadding>
              <Container>
                <div className="max-w-3xl mx-auto border border-green-200 bg-green-50 rounded-lg p-6 text-center space-y-4">
                  <h2 className="text-2xl font-semibold font-sans text-green-900">
                    Account created successfully
                  </h2>
                  <p className="font-serif text-green-800">
                    Your account is ready. Subscribe now to unlock access to the platform and protected content.
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Button onClick={handleSubscribe}>Subscribe Now</Button>
                    <Button variant="outline" onClick={handleViewCollections}>
                      Explore the Platform
                    </Button>
                  </div>
                </div>
              </Container>
            </PagePadding>
          </section>
        ) : null}

        <section className="py-16">
          <PagePadding>
            <Container>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-black p-8 space-y-6">
                  <h3 className="text-2xl font-semibold font-sans">
                    Profile Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold font-sans uppercase mb-2">
                        Name
                      </label>
                      <p className="font-serif text-lg">
                        {user?.displayName || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold font-sans uppercase mb-2">
                        Email
                      </label>
                      <p className="font-serif text-lg">{user?.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold font-sans uppercase mb-2">
                        Member Since
                      </label>
                      <p className="font-serif text-lg">
                        {user?.metadata?.creationTime
                          ? new Date(user.metadata.creationTime).toLocaleDateString(
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

                    <div>
                      <label className="block text-sm font-semibold font-sans uppercase mb-2">
                        Style Preferences
                      </label>
                      <div className="space-y-2">
                        <p className="font-serif text-sm text-gray-600">
                          • Casual Style: Not set
                        </p>
                        <p className="font-serif text-sm text-gray-600">
                          • Work Style: Not set
                        </p>
                        <p className="font-serif text-sm text-gray-600">
                          • Budget Range: Not set
                        </p>
                        <p className="font-serif text-xs text-blue-600 mt-2">
                          Click "Edit Profile" to set your preferences
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleEditProfile}
                    >
                      Edit Profile
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>

                <div className="border border-black p-8 space-y-6">
                  <h3 className="text-2xl font-semibold font-sans">
                    Subscription & Access
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                      <div className="text-sm font-semibold font-sans uppercase mb-1">
                        Current Status
                      </div>

                      {loadingSubscription ? (
                        <p className="text-sm font-serif text-gray-600">
                          Loading subscription details...
                        </p>
                      ) : (
                        <>
                          <div className="text-lg font-semibold font-sans">
                            {subscriptionStatusLabel}
                          </div>

                          <p className="text-sm font-serif text-gray-600 mt-2">
                            {hasActiveSubscription
                              ? 'Your subscription is active and your account should have access to protected content.'
                              : 'Your subscription is not currently active. Subscribe to restore full access.'}
                          </p>
                        </>
                      )}
                    </div>

                    {hasActiveSubscription ? (
                      <Button
                        className="w-full"
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                      >
                        {portalLoading
                          ? 'Opening Subscription Portal...'
                          : 'Manage / Cancel Subscription'}
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={handleSubscribe}>
                        Subscribe Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-12 border border-black p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold font-sans">
                      Saved Favorites
                    </h3>
                    <p className="font-serif text-sm text-muted mt-2">
                      Outfits and items you save will appear here for quick access.
                    </p>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleWeeklyFinds}>
                      Browse Weekly Finds
                    </Button>
                    <Button size="sm" onClick={handleViewCollections}>
                      Browse Outfits
                    </Button>
                  </div>
                </div>

                {loadingFavorites ? (
                  <p className="font-serif text-sm text-muted">
                    Loading saved favorites...
                  </p>
                ) : favorites.length === 0 ? (
                  <div className="border border-gray-200 bg-gray-50 p-6 text-center">
                    <h4 className="text-lg font-semibold font-sans mb-2">
                      No saved favorites yet
                    </h4>
                    <p className="font-serif text-sm text-muted">
                      Save outfits or weekly items as you browse, then return here anytime.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => {
                      const targetHref =
                        favorite.href ||
                        (favorite.type === 'outfit'
                          ? `/outfit-inspiration/${favorite.contentId}`
                          : favorite.externalUrl || '/weekly')

                      return (
                        <div
                          key={favorite.id}
                          className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                        >
                          <div className="aspect-[4/3] bg-gray-100 relative">
                            {favorite.imageUrl ? (
                              <Image
                                src={favorite.imageUrl}
                                alt={favorite.title}
                                fill
                                className="object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {favorite.type === 'outfit' ? 'Outfit' : 'Item'}
                              </span>

                              {favorite.category ? (
                                <span className="text-xs font-serif text-gray-500">
                                  {favorite.category}
                                </span>
                              ) : null}
                            </div>

                            <div>
                              {favorite.brand ? (
                                <p className="text-xs font-serif uppercase tracking-wide text-gray-500 mb-1">
                                  {favorite.brand}
                                </p>
                              ) : null}

                              <h4 className="font-semibold font-sans text-lg">
                                {favorite.title}
                              </h4>

                              {favorite.price ? (
                                <p className="text-sm font-semibold mt-1">
                                  {favorite.price}
                                </p>
                              ) : null}
                            </div>

                            {favorite.description ? (
                              <p className="font-serif text-sm text-muted line-clamp-2">
                                {favorite.description}
                              </p>
                            ) : null}

                            <div className="flex gap-3 pt-2">
                              {targetHref.startsWith('http') ? (
                                <a
                                  href={targetHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 border border-black px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
                                >
                                  Open
                                </a>
                              ) : (
                                <Link
                                  href={targetHref}
                                  className="flex-1 border border-black px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
                                >
                                  Open
                                </Link>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveFavorite(favorite)}
                                disabled={removingFavoriteId === favorite.id}
                              >
                                {removingFavoriteId === favorite.id
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

              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <h4 className="text-lg font-semibold font-sans mb-2">
                    Browse Collections
                  </h4>
                  <p className="text-sm font-serif text-muted mb-4">
                    Explore our curated affiliate collections
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewCollections}
                  >
                    View Collections
                  </Button>
                </div>

                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <h4 className="text-lg font-semibold font-sans mb-2">
                    Weekly Finds
                  </h4>
                  <p className="text-sm font-serif text-muted mb-4">
                    Discover this week&apos;s best fashion picks
                  </p>
                  <Button size="sm" onClick={handleWeeklyFinds}>
                    Browse Finds
                  </Button>
                </div>

                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <h4 className="text-lg font-semibold font-sans mb-2">
                    Style Consultation
                  </h4>
                  <p className="text-sm font-serif text-muted mb-4">
                    Book a 1:1 styling session
                  </p>
                  <Button size="sm" onClick={handleBookSession}>
                    Book Now
                  </Button>
                </div>

                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <h4 className="text-lg font-semibold font-sans mb-2">
                    Wardrobe Audit
                  </h4>
                  <p className="text-sm font-serif text-muted mb-4">
                    Optimize your existing wardrobe
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLearnMore}
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
      </>
    </ProtectedRoute>
  )
}