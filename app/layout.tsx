import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/figtree";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { cafe } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: `${cafe.name} | ${cafe.tagline}`, template: `%s | ${cafe.name}` },
  description: `${cafe.name} serves burgers, shawarma, pizza, sandwiches, shakes and coffee. Build your cart and order on WhatsApp.`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2">
          Skip to content
        </a>
        <Suspense fallback={null}>
           <Navbar />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
