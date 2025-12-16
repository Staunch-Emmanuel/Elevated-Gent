'use client';

import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full py-4 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold">
          The Elevated Gentleman
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/articles">Articles</Link>
          <Link href="/personal-styling">Styling</Link>

          {user ? (
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          ) : (
            <Link href="/auth/signin">
              <Button variant="default">Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
