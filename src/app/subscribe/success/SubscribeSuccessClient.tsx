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
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-semibold mb-4">Payment Successful 🎉</h1>
        <p className="text-gray-600">
          Activating your subscription...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-semibold mb-4">Subscription Activated 🎉</h1>
        <p className="text-gray-600 mb-8">
          Your subscription is active. Redirecting you to Personal Styling...
        </p>
      </div>
    );
  }

  if (status === "idle") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-semibold mb-4">Payment Successful 🎉</h1>

        <p className="text-gray-600 mb-8">
          Login to activate your subscription on this account.
        </p>

        <div className="space-y-4 w-full max-w-sm">
          <Link
            href="/auth/signup"
            className="block w-full bg-black text-white py-3 rounded"
          >
            Create Account
          </Link>

          <Link
            href="/auth/signin"
            className="block w-full border border-black py-3 rounded"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-semibold mb-4">Payment Successful 🎉</h1>

      <p className="text-red-600 mb-8">
        {error || "Something went wrong while activating your subscription."}
      </p>

      <div className="space-y-4 w-full max-w-sm">
        <Link
          href="/personal-styling"
          className="block w-full bg-black text-white py-3 rounded"
        >
          Go to Personal Styling
        </Link>

        <Link
          href="/subscribe"
          className="block w-full border border-black py-3 rounded"
        >
          Back to Subscribe
        </Link>
      </div>
    </div>
  );
}