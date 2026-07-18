"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth";

export default function SubscribeSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [status, setStatus] = useState<
    "loading" | "activating" | "success" | "idle" | "error"
  >("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      localStorage.setItem("eg_checkout_session_id", sessionId);
    }
  }, [searchParams]);

  useEffect(() => {
    async function activate() {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setStatus("error");
        setError("Missing checkout session.");
        return;
      }

      if (loading) return;

      if (!user) {
        setStatus("idle");
        return;
      }

      try {
        setStatus("activating");

        const token = await user.getIdToken();

        const response = await fetch("/api/stripe/confirm-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Failed to activate subscription");
        }

        localStorage.removeItem("eg_checkout_session_id");
        setStatus("success");

        setTimeout(() => {
          router.replace("/personal-styling?subscription=success");
        }, 1200);
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setError(err?.message || "Failed to activate subscription.");
      }
    }

    activate();
  }, [searchParams, user, loading, router]);

  if (status === "loading" || status === "activating") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-eg-espresso-deep)] px-6 py-20 text-center text-[var(--color-eg-cream)]">
        <div className="w-full max-w-xl space-y-6">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[rgba(248,241,229,0.28)] border-t-[var(--color-eg-cream)]" />

          <h1 className="font-editorial text-4xl font-normal text-[var(--color-eg-cream)] md:text-5xl">
            Payment Successful 🎉
          </h1>

          <p className="font-serif text-lg text-[var(--color-text-muted)]">
            Activating your subscription...
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-eg-espresso-deep)] px-6 py-20 text-center text-[var(--color-eg-cream)]">
        <div className="w-full max-w-xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-eg-cream)] text-[var(--color-eg-espresso-deep)]">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="font-editorial text-4xl font-normal text-[var(--color-eg-cream)] md:text-5xl">
            Subscription Activated 🎉
          </h1>

          <p className="font-serif text-lg leading-8 text-[var(--color-text-muted)]">
            Your subscription is active. Redirecting you to Personal Styling...
          </p>
        </div>
      </div>
    );
  }

  if (status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-eg-espresso-deep)] px-6 py-20 text-center text-[var(--color-eg-cream)]">
        <div className="w-full max-w-lg border border-[var(--color-eg-line-light)] bg-[rgba(248,241,229,0.06)] p-7 shadow-[0_24px_70px_rgba(24,23,17,0.28)] sm:p-10">
          <h1 className="mb-4 font-editorial text-4xl font-normal text-[var(--color-eg-cream)] md:text-5xl">
            Payment Successful 🎉
          </h1>

          <p className="mb-8 font-serif text-lg leading-8 text-[var(--color-text-muted)]">
            Login to activate your subscription on this account.
          </p>

          <div className="w-full space-y-4">
            <Link
              href="/auth/signup"
              className="block w-full border border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] transition-colors hover:bg-transparent hover:text-[var(--color-eg-cream)]"
            >
              Create Account
            </Link>

            <Link
              href="/auth/signin"
              className="block w-full border border-[var(--color-eg-cream)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-cream)] transition-colors hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-eg-espresso-deep)] px-6 py-20 text-center text-[var(--color-eg-cream)]">
      <div className="w-full max-w-lg border border-[var(--color-eg-line-light)] bg-[rgba(248,241,229,0.06)] p-7 shadow-[0_24px_70px_rgba(24,23,17,0.28)] sm:p-10">
        <h1 className="mb-4 font-editorial text-4xl font-normal text-[var(--color-eg-cream)] md:text-5xl">
          Payment Successful 🎉
        </h1>

        <p className="mb-8 font-serif leading-7 text-[#f5cfc7]">
          {error || "Something went wrong while activating your subscription."}
        </p>

        <div className="w-full space-y-4">
          <Link
            href="/personal-styling"
            className="block w-full border border-[var(--color-eg-cream)] bg-[var(--color-eg-cream)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-espresso-deep)] transition-colors hover:bg-transparent hover:text-[var(--color-eg-cream)]"
          >
            Go to Personal Styling
          </Link>

          <Link
            href="/subscribe"
            className="block w-full border border-[var(--color-eg-cream)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-eg-cream)] transition-colors hover:bg-[var(--color-eg-cream)] hover:text-[var(--color-eg-espresso-deep)]"
          >
            Back to Subscribe
          </Link>
        </div>
      </div>
    </div>
  );
}