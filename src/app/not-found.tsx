import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-5xl font-semibold">404</h1>
        <p className="text-lg text-gray-600">
          The page you are looking for could not be found.
        </p>
        <Link
          href="/personal-styling"
          className="inline-block rounded bg-black px-6 py-3 text-sm text-white"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}