import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-eg-cream)] px-6 text-[var(--color-eg-ink)]">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-5xl font-semibold">404</h1>
        <p className="text-lg text-[var(--color-eg-muted)]">
          The page you are looking for could not be found.
        </p>
        <Link
          href="/personal-styling"
          className="inline-block rounded bg-[var(--color-eg-espresso)] px-6 py-3 text-sm text-[var(--color-eg-cream)]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}