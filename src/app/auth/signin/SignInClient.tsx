// src/app/auth/signin/SignInClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth";
import { Button } from "@/components/ui";
import { PagePadding, Container } from "@/components/layout";

export default function SignInClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    if (!next) return "/personal-styling";
    if (!next.startsWith("/")) return "/personal-styling";
    return next;
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(trimmedEmail, trimmedPassword);

      if (!result || result.success !== true) {
        setError(result?.error || "Incorrect email or password.");
        return;
      }

      router.push(nextPath);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/images/Image-10.jpeg"
          alt="The Elevated Gentleman Fashion"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="text-white">
            <h2 className="text-2xl font-semibold font-sans mb-2">
              ELEVATE YOUR STYLE
            </h2>
            <p className="text-white/90 font-serif">
              Professional styling services for the modern gentleman
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center">
        <PagePadding>
          <Container size="small">
            <div className="flex flex-col items-center justify-center min-h-screen py-12">
              <div className="w-full max-w-md">
                <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg lg:shadow-xl">
                  <h1 className="text-3xl font-semibold font-sans text-center mb-2">
                    Welcome Back
                  </h1>
                  <p className="text-gray-600 font-serif text-center mb-8">
                    Sign in to access your styling services
                  </p>

                  {error ? (
                    <div
                      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                      role="alert"
                      aria-live="polite"
                    >
                      <p className="text-red-600 text-sm font-serif">{error}</p>
                    </div>
                  ) : null}

                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 font-serif mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent hover:border-gray-400 transition-all duration-200 ease-in-out font-serif"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 font-serif mb-2"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent hover:border-gray-400 transition-all duration-200 ease-in-out font-serif"
                        placeholder="Enter your password"
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full py-3">
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-gray-600 hover:text-black font-serif"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-600 font-serif">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/auth/signup"
                        className="text-black hover:underline font-medium"
                      >
                        Create Account
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500 font-serif">
                    Access your personalized styling services, appointments, and
                    order history.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </PagePadding>
      </div>
    </div>
  );
}