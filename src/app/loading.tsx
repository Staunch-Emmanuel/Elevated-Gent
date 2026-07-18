export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-eg-espresso-deep)] px-6 text-[var(--color-eg-cream)]">
      <div className="text-center">
        <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-[rgba(232,235,236,0.28)] border-t-[var(--color-eg-cream)]" />

        <p className="font-serif text-[var(--color-text-muted)]">
          Loading...
        </p>
      </div>
    </div>
  )
}