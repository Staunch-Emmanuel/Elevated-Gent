'use client'

export default function AdminDashboardPage() {
  return (
    <div className="min-h-full px-7 py-10 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <section className="border border-[#817E6C] bg-[#E8EBEC] p-8 shadow-[0_18px_48px_rgba(36,35,29,0.07)] sm:p-10">
          <h1 className="font-editorial text-5xl font-normal leading-tight tracking-[-0.035em] text-[#24231d]">
            Admin Dashboard
          </h1>

          <p className="mt-4 max-w-2xl font-serif text-base leading-8 text-[#575348]">
            Welcome to the admin panel. Use the sidebar to manage content.
          </p>
        </section>

        <section className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_10px_28px_rgba(36,35,29,0.05)]">
            <div className="mb-5 h-px w-full bg-[#817E6C]" />

            <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
              Homepage
            </h2>

            <p className="mt-3 font-serif text-sm leading-6 text-[#625e53]">
              Manage homepage sections and featured content.
            </p>
          </div>

          <div className="border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_10px_28px_rgba(36,35,29,0.05)]">
            <div className="mb-5 h-px w-full bg-[#817E6C]" />

            <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
              Articles
            </h2>

            <p className="mt-3 font-serif text-sm leading-6 text-[#625e53]">
              Create and manage editorial content.
            </p>
          </div>

          <div className="border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_10px_28px_rgba(36,35,29,0.05)]">
            <div className="mb-5 h-px w-full bg-[#817E6C]" />

            <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
              Weekly
            </h2>

            <p className="mt-3 font-serif text-sm leading-6 text-[#625e53]">
              Manage weekly finds and curated products.
            </p>
          </div>

          <div className="border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_10px_28px_rgba(36,35,29,0.05)]">
            <div className="mb-5 h-px w-full bg-[#817E6C]" />

            <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
              Wellness
            </h2>

            <p className="mt-3 font-serif text-sm leading-6 text-[#625e53]">
              Manage wellness-related content and resources.
            </p>
          </div>

          <div className="border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_10px_28px_rgba(36,35,29,0.05)]">
            <div className="mb-5 h-px w-full bg-[#817E6C]" />

            <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
              Outfits
            </h2>

            <p className="mt-3 font-serif text-sm leading-6 text-[#625e53]">
              Manage outfit inspiration and shoppable looks.
            </p>
          </div>

          <div className="border border-[#817E6C] bg-[#E8EBEC] p-6 shadow-[0_10px_28px_rgba(36,35,29,0.05)]">
            <div className="mb-5 h-px w-full bg-[#817E6C]" />

            <h2 className="font-editorial text-2xl font-normal text-[#24231d]">
              Personal Styling
            </h2>

            <p className="mt-3 font-serif text-sm leading-6 text-[#625e53]">
              Manage styling services and related content.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}