// src/app/(protected)/account/page.tsx
'use client'

import { useState } from 'react'
import { PagePadding, Container } from '@/components/layout'
import { Button } from '@/components/ui'
import { useAuth } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import { ProfileEditModal } from '@/components/account/ProfileEditModal'

export default function AccountPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showEditProfile, setShowEditProfile] = useState(false)

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

  const handleSignOut = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      {/* Hero Section */}
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

      {/* Account Dashboard */}
      <section className="py-16">
        <PagePadding>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile */}
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

              {/* Styling Sessions */}
              <div className="border border-black p-8 space-y-6">
                <h3 className="text-2xl font-semibold font-sans">
                  Styling Services
                </h3>

                <div className="space-y-4">
                  <p className="font-serif text-muted">
                    Book and manage your styling appointments and view session
                    history.
                  </p>

                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                      <div className="text-sm font-semibold font-sans uppercase mb-1">
                        Available Services
                      </div>

                      <div className="text-sm font-serif space-y-1">
                        <div>• Virtual styling consultations</div>
                        <div>• Curated collections based on your style</div>
                        <div>• Personal shopping recommendations</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full" onClick={handleBookSession}>
                  Book Your First Session
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
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

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </>
  )
}
