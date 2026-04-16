'use client'

import { useMemo, useRef, useState } from 'react'
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'

import { storage } from '@/lib/firebase/config'

type CMSVideoUploadFieldProps = {
  label: string
  folder: string
  documentSlug: string
  value: string
  onChange: (value: string) => void
  helpText?: string
  disabled?: boolean
}

function sanitizeFileName(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizePathSegment(value: string): string {
  return String(value || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9/_-]+/g, '-')
}

function isFirebaseStorageUrl(value: string): boolean {
  return value.includes('firebasestorage.googleapis.com')
}

function getPreviewName(value: string): string {
  if (!value) return ''

  try {
    const url = new URL(value)
    const match = url.pathname.match(/\/o\/(.+)$/)

    if (match?.[1]) {
      return decodeURIComponent(match[1]).split('/').pop() || value
    }

    return decodeURIComponent(url.pathname.split('/').pop() || value)
  } catch {
    return value
  }
}

export default function CMSVideoUploadField({
  label,
  folder,
  documentSlug,
  value,
  onChange,
  helpText,
  disabled = false,
}: CMSVideoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const isBusy = disabled || uploading
  const previewName = useMemo(() => getPreviewName(value), [value])

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    setError('')

    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file.')
      event.target.value = ''
      return
    }

    try {
      setUploading(true)
      setProgress(0)

      const safeFolder = sanitizePathSegment(folder || 'auth')
      const safeSlug = sanitizeFileName(documentSlug || 'auth-video')
      const extension = file.name.includes('.')
        ? file.name.substring(file.name.lastIndexOf('.'))
        : '.mp4'

      const fileName = `${safeSlug}-${Date.now()}${extension}`
      const storageRef = ref(storage, `${safeFolder}/${fileName}`)
      const task = uploadBytesResumable(storageRef, file)

      await new Promise<void>((resolve, reject) => {
        task.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            )
            setProgress(pct)
          },
          (uploadError) => reject(uploadError),
          () => resolve()
        )
      })

      const downloadUrl = await getDownloadURL(task.snapshot.ref)
      onChange(downloadUrl)
      setProgress(100)
    } catch (uploadError) {
      console.error('Video upload failed:', uploadError)
      setError('Failed to upload video.')
      setProgress(0)
    } finally {
      setUploading(false)

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  async function handleRemove() {
    if (!value) return

    setError('')

    try {
      if (isFirebaseStorageUrl(value)) {
        try {
          await deleteObject(ref(storage, value))
        } catch {
          // Ignore delete failures for files that may already be missing.
        }
      }

      onChange('')
      setProgress(0)

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (removeError) {
      console.error('Failed to remove video:', removeError)
      setError('Failed to remove video.')
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-gray-200 bg-gray-50/70 p-5">
      <div>
        <label className="block text-sm font-medium text-gray-900">{label}</label>
        {helpText ? <p className="mt-1 text-xs text-gray-500">{helpText}</p> : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={isBusy}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isBusy}
        className="flex w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-8 text-center transition hover:border-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {value ? 'Choose a replacement video' : 'Choose a video'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            MP4, MOV and other standard video formats
          </p>
        </div>
      </button>

      {uploading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-900">Uploading video</span>
            <span className="text-gray-500">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-black transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {value ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="aspect-video bg-black">
            <video
              src={value}
              controls
              playsInline
              className="h-full w-full bg-black object-contain"
            />
          </div>

          <div className="space-y-3 p-4">
            <div>
              <p className="truncate text-sm font-medium text-gray-900">{previewName}</p>
              <p className="mt-1 text-xs text-gray-500">Saved video</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRemove}
                disabled={isBusy}
                className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
              >
                Remove Video
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
          No video selected yet
        </div>
      )}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}