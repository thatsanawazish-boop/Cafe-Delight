import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/owner-auth";

export const metadata: Metadata = { title: "Owner sign in", robots: { index: false, follow: false } };

export default function OwnerSignIn() {
  if (!clerkConfigured()) return <p className="px-4 py-24 text-center text-roast">Clerk is not set up yet. See the README.</p>;
  return (
    <div className="grid place-items-center px-4 py-16">
      <SignIn routing="path" path="/admin/sign-in" />
    </div>
  );
}
