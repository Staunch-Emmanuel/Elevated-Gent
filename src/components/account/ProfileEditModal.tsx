'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/firebase/auth'
import { Button, Label } from '@/components/ui'
import { updateProfile, updatePassword } from 'firebase/auth'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Profile form state
  const [displayName, setDisplayName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Style preferences
  const [stylePreferences, setStylePreferences] = useState({
    casualStyle: '',
    workStyle: '',
    formalStyle: '',
    colorPreferences: '',
    budgetRange: '',
    notifications: true,
    newsletter: true
  })

  useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.displayName || '')
      // In a real app, you'd load style preferences from Firestore
    }
  }, [user, isOpen])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Update display name
      if (displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: displayName.trim()
        })
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        await updatePassword(user, newPassword)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }

      // In a real app, save style preferences to Firestore here
      // await updateUserPreferences(user.uid, stylePreferences)

      setSuccess('Profile updated successfully!')
      setTimeout(() => {
        setSuccess('')
        onClose()
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(24,23,17,0.78)] p-4 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[var(--color-eg-line)] bg-[var(--color-eg-cream)] p-6 text-[var(--color-eg-ink)] shadow-[0_28px_80px_rgba(24,23,17,0.38)] sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-eg-muted)] transition-colors duration-200 hover:bg-[var(--color-eg-paper)] hover:text-[var(--color-eg-ink)]"
          aria-label="Close modal"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-8 pr-12">
          <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-eg-muted)]">
            Account Settings
          </p>

          <h2 className="font-editorial text-4xl font-normal leading-tight tracking-[-0.03em] text-[var(--color-eg-ink)]">
            Edit Profile
          </h2>

          <p className="mt-3 font-serif leading-7 text-[var(--color-eg-muted)]">
            Update your account information and style preferences
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-[#d9aaa4] bg-[#fbefed] p-4">
            <p className="font-serif text-sm text-[#913a32]">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 border border-[#aebc98] bg-[#eef3e7] p-4">
            <p className="font-serif text-sm text-[#40512f]">{success}</p>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-10">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="border-b border-[var(--color-eg-line)] pb-3 font-editorial text-2xl font-normal text-[var(--color-eg-ink)]">
              Basic Information
            </h3>

            <div>
              <label
                htmlFor="displayName"
                className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
              >
                Display Name
              </label>

              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors placeholder:text-[rgba(98,94,83,0.68)] hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label className="mb-2 block w-fit cursor-default border-0 bg-transparent px-0 py-0 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] hover:scale-100 hover:bg-transparent hover:text-[var(--color-eg-espresso-deep)]">
                Email Address
              </Label>

              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full cursor-not-allowed border border-[var(--color-eg-line)] bg-[var(--color-eg-paper-soft)] px-4 py-3 font-serif text-[var(--color-eg-muted)]"
              />

              <p className="mt-2 font-serif text-xs text-[var(--color-eg-muted)]">
                Email cannot be changed
              </p>
            </div>
          </div>

          {/* Password Update */}
          <div className="space-y-6">
            <h3 className="border-b border-[var(--color-eg-line)] pb-3 font-editorial text-2xl font-normal text-[var(--color-eg-ink)]">
              Change Password
            </h3>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
              >
                New Password (optional)
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors placeholder:text-[rgba(98,94,83,0.68)] hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                placeholder="Leave blank to keep current password"
              />
            </div>

            {newPassword && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors placeholder:text-[rgba(98,94,83,0.68)] hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                  placeholder="Confirm your new password"
                />
              </div>
            )}
          </div>

          {/* Style Preferences */}
          <div className="space-y-6">
            <h3 className="border-b border-[var(--color-eg-line)] pb-3 font-editorial text-2xl font-normal text-[var(--color-eg-ink)]">
              Style Preferences
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="casualStyle"
                  className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
                >
                  Casual Style
                </label>

                <select
                  id="casualStyle"
                  value={stylePreferences.casualStyle}
                  onChange={(e) =>
                    setStylePreferences({
                      ...stylePreferences,
                      casualStyle: e.target.value
                    })
                  }
                  className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                >
                  <option value="">Select preference</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="streetwear">Streetwear</option>
                  <option value="classic">Classic</option>
                  <option value="bohemian">Bohemian</option>
                  <option value="athletic">Athletic</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="workStyle"
                  className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
                >
                  Work Style
                </label>

                <select
                  id="workStyle"
                  value={stylePreferences.workStyle}
                  onChange={(e) =>
                    setStylePreferences({
                      ...stylePreferences,
                      workStyle: e.target.value
                    })
                  }
                  className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                >
                  <option value="">Select preference</option>
                  <option value="business-formal">Business Formal</option>
                  <option value="business-casual">Business Casual</option>
                  <option value="smart-casual">Smart Casual</option>
                  <option value="creative">Creative</option>
                  <option value="remote">Remote/Casual</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="colorPreferences"
                  className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
                >
                  Color Preferences
                </label>

                <input
                  id="colorPreferences"
                  type="text"
                  value={stylePreferences.colorPreferences}
                  onChange={(e) =>
                    setStylePreferences({
                      ...stylePreferences,
                      colorPreferences: e.target.value
                    })
                  }
                  className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors placeholder:text-[rgba(98,94,83,0.68)] hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                  placeholder="e.g. earth tones, bold colors, monochrome"
                />
              </div>

              <div>
                <label
                  htmlFor="budgetRange"
                  className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)]"
                >
                  Budget Range
                </label>

                <select
                  id="budgetRange"
                  value={stylePreferences.budgetRange}
                  onChange={(e) =>
                    setStylePreferences({
                      ...stylePreferences,
                      budgetRange: e.target.value
                    })
                  }
                  className="w-full border border-[var(--color-eg-line)] bg-[var(--color-eg-paper)] px-4 py-3 font-serif text-[var(--color-eg-ink)] outline-none transition-colors hover:border-[var(--color-eg-espresso-soft)] focus:border-[var(--color-eg-espresso-deep)]"
                >
                  <option value="">Select range</option>
                  <option value="budget">Budget ($50-150)</option>
                  <option value="mid-range">Mid-range ($150-400)</option>
                  <option value="premium">Premium ($400-800)</option>
                  <option value="luxury">Luxury ($800+)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-6">
            <h3 className="border-b border-[var(--color-eg-line)] pb-3 font-editorial text-2xl font-normal text-[var(--color-eg-ink)]">
              Preferences
            </h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  id="notifications"
                  type="checkbox"
                  checked={stylePreferences.notifications}
                  onChange={(e) =>
                    setStylePreferences({
                      ...stylePreferences,
                      notifications: e.target.checked
                    })
                  }
                  className="mt-1 h-4 w-4 rounded border-[var(--color-eg-line)] accent-[var(--color-eg-espresso-deep)]"
                />

                <label
                  htmlFor="notifications"
                  className="ml-3 font-serif text-sm leading-6 text-[var(--color-eg-muted)]"
                >
                  Receive styling session reminders and updates
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="newsletter"
                  type="checkbox"
                  checked={stylePreferences.newsletter}
                  onChange={(e) =>
                    setStylePreferences({
                      ...stylePreferences,
                      newsletter: e.target.checked
                    })
                  }
                  className="mt-1 h-4 w-4 rounded border-[var(--color-eg-line)] accent-[var(--color-eg-espresso-deep)]"
                />

                <label
                  htmlFor="newsletter"
                  className="ml-3 font-serif text-sm leading-6 text-[var(--color-eg-muted)]"
                >
                  Subscribe to weekly style tips and product recommendations
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 border-t border-[var(--color-eg-line)] pt-6 sm:flex-row sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}