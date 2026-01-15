import type { Metadata } from "next";
import { Bitter } from "next/font/google";
import "./globals.css";
import "@/components/editor/editor.css";

import Header from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_CONFIG } from "@/lib/constants";
import { AuthProvider } from "@/lib/firebase/auth";
import { CartProvider } from "@/lib/hooks/useCart";

const bitter = Bitter({
  subsets: ["latin"],
  variable: "--font-bitter",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={bitter.variable}>
        <AuthProvider>
          <CartProvider>
            <div className="page-wrapper">
              <Header />
              <main className="main-wrapper">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
