import { Suspense, type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/owner-auth";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  if (!clerkConfigured()) return <>{children}</>;
  return (
    <Suspense fallback={<p className="px-4 py-24 text-center text-roast">Loading…</p>}>
      <ClerkProvider>{children}</ClerkProvider>
    </Suspense>
  );
}
