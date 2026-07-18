'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { auth } from '@/lib/firebase/config'

type UploadMode = 'single' | 'multiple'

interface CMSImageUploadFieldProps {
  label: string
  folder: string
  documentSlug?: string
  mode?: UploadMode
  value: string | string[]
  onChange: (value: string | string[]) => void
  helpText?: string
  disabled?: boolean
}

interface LocalPreviewFile {
  id: string
  file: File
  previewUrl: string
}

interface UploadResponse {
  success: boolean
  error?: string
  uploads?: Array<{
    url: string
    path: string
    contentType: string
    size: number
    name: string
  }>
}

function sanitizePathSegment(value: string): string {
  return String(value || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9/_-]+/g, '-')
}

function sanitizeDocumentSlug(value?: string): string {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return ''

  const units = ['B', 'KB', 'MB', 'GB']
  let value = size
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toFixed(
    value >= 10 || unitIndex === 0 ? 0 : 1
  )} ${units[unitIndex]}`
}

export default function CMSImageUploadField({
  label,
  folder,
  documentSlug,
  mode = 'single',
  value,
  onChange,
  helpText,
  disabled = false,
}: CMSImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [localFiles, setLocalFiles] = useState<LocalPreviewFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const remoteUrls = useMemo(() => {
    if (mode === 'multiple') {
      return Array.isArray(value) ? value : []
    }

    return typeof value === 'string' && value ? [value] : []
  }, [mode, value])

  useEffect(() => {
    return () => {
      localFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [localFiles])

  function openFileDialog() {
    if (disabled || uploading) return
    inputRef.current?.click()
  }

  function clearLocalFiles() {
    localFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setLocalFiles([])
  }

  function handleFilesSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError('')

    const selectedFiles = Array.from(event.target.files ?? [])

    if (!selectedFiles.length) return

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith('image/')
    )

    if (!imageFiles.length) {
      setError('Please choose a valid image file.')
      event.target.value = ''
      return
    }

    clearLocalFiles()

    const nextLocalFiles = imageFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    if (mode === 'single') {
      setLocalFiles(nextLocalFiles.slice(0, 1))
    } else {
      setLocalFiles(nextLocalFiles)
    }

    event.target.value = ''
  }

  async function uploadFiles() {
    try {
      setError('')

      const currentUser = auth.currentUser

      if (!currentUser) {
        throw new Error(
          'You must be signed in as an admin to upload images'
        )
      }

      if (!localFiles.length) {
        throw new Error('Please choose an image first')
      }

      setUploading(true)

      const token = await currentUser.getIdToken()
      const formData = new FormData()

      formData.append('folder', sanitizePathSegment(folder))

      const safeSlug = sanitizeDocumentSlug(documentSlug)

      if (safeSlug) {
        formData.append('documentSlug', safeSlug)
      }

      const filesToUpload =
        mode === 'single' ? localFiles.slice(0, 1) : localFiles

      filesToUpload.forEach((item) => {
        formData.append('files', item.file)
      })

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = (await response.json()) as UploadResponse

      if (!response.ok || !data.success || !data.uploads) {
        throw new Error(data.error || 'Upload failed')
      }

      const uploadedUrls = data.uploads.map((item) => item.url)

      if (mode === 'single') {
        onChange(uploadedUrls[0] ?? '')
      } else {
        const existing = Array.isArray(value) ? value : []
        onChange([...existing, ...uploadedUrls])
      }

      clearLocalFiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function removeExistingImage(index: number) {
    if (mode === 'single') {
      onChange('')
      return
    }

    const current = Array.isArray(value) ? value : []
    const next = current.filter(
      (_, currentIndex) => currentIndex !== index
    )

    onChange(next)
  }

  const previewItems = [
    ...remoteUrls.map((url, index) => ({
      key: `remote-${index}`,
      url,
      isLocal: false,
      index,
      fileName: 'Saved image',
      fileSize: '',
    })),
    ...localFiles.map((item, index) => ({
      key: `local-${item.id}-${index}`,
      url: item.previewUrl,
      isLocal: true,
      index,
      fileName: item.file.name,
      fileSize: formatFileSize(item.file.size),
    })),
  ]

  return (
    <div className="space-y-5 border border-[#c8bcaa] bg-[#f2eadf] p-5 text-[#24231d] shadow-[0_10px_28px_rgba(36,35,29,0.05)]">
      <div>
        <label className="block font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b]">
          {label}
        </label>

        {helpText ? (
          <p className="mt-2 font-serif text-xs leading-5 text-[#625e53]">
            {helpText}
          </p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={mode === 'multiple'}
        className="hidden"
        onChange={handleFilesSelected}
        disabled={disabled || uploading}
      />

      <button
        type="button"
        onClick={openFileDialog}
        disabled={disabled || uploading}
        className="flex w-full items-center justify-center border border-dashed border-[#9d927f] bg-[#f8f1e5] px-5 py-9 text-center transition-colors hover:border-[#4f4b3b] hover:bg-[#e9dfd1] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-[#4f4b3b] bg-[#4f4b3b] text-[#f8f1e5]">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"
              />
            </svg>
          </div>

          <p className="font-serif text-sm font-semibold text-[#24231d]">
            {mode === 'single'
              ? remoteUrls.length || localFiles.length
                ? 'Choose a replacement image'
                : 'Choose an image'
              : 'Choose images'}
          </p>

          <p className="mt-2 font-serif text-xs text-[#625e53]">
            JPG, PNG, WEBP and other standard image formats
          </p>
        </div>
      </button>

      {previewItems.length > 0 ? (
        <div
          className={
            mode === 'multiple'
              ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
              : 'grid grid-cols-1 gap-4'
          }
        >
          {previewItems.map((item) => (
            <div
              key={item.key}
              className="overflow-hidden border border-[#c8bcaa] bg-[#f8f1e5] shadow-[0_8px_22px_rgba(36,35,29,0.06)]"
            >
              <div className="aspect-[16/9] bg-[#e9dfd1]">
                <img
                  src={item.url}
                  alt={label}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-3 border-t border-[#c8bcaa] p-4">
                <div className="min-w-0">
                  <p className="truncate font-serif text-sm font-semibold text-[#24231d]">
                    {item.fileName}
                  </p>

                  <p className="mt-1 font-serif text-xs text-[#625e53]">
                    {item.isLocal ? 'Selected preview' : 'Saved image'}
                    {item.fileSize ? ` • ${item.fileSize}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!item.isLocal ? (
                    <button
                      type="button"
                      onClick={() => removeExistingImage(item.index)}
                      className="border border-[#a65a50] bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#913a32] transition-colors hover:bg-[#913a32] hover:text-[#f8f1e5] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={disabled || uploading}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-[#b9ae9d] bg-[#f8f1e5] px-4 py-8 text-center font-serif text-sm text-[#625e53]">
          No image selected yet
        </div>
      )}

      {localFiles.length > 0 ? (
        <div className="flex flex-wrap gap-3 border-t border-[#c8bcaa] pt-5">
          <button
            type="button"
            onClick={uploadFiles}
            disabled={disabled || uploading}
            className="border border-[#4f4b3b] bg-[#4f4b3b] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#f8f1e5] transition-colors hover:bg-transparent hover:text-[#4f4b3b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload Selected'}
          </button>

          <button
            type="button"
            onClick={clearLocalFiles}
            disabled={disabled || uploading}
            className="border border-[#77725d] bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#4f4b3b] transition-colors hover:bg-[#4f4b3b] hover:text-[#f8f1e5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear Selection
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="border border-[#d9aaa4] bg-[#fbefed] px-4 py-3 font-serif text-sm text-[#913a32]">
          {error}
        </p>
      ) : null}
    </div>
  )
}