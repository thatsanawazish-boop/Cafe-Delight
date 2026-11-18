import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { clerkConfigured, getRole } from "@/lib/owner-auth";
import { setAdminRole } from "../actions";

export const metadata: Metadata = { title: "Admin access", robots: { index: false, follow: false } };

async function Access() {
  await connection();
  if (!clerkConfigured() || (await getRole()) !== "owner") {
    return <p className="px-4 py-24 text-center text-roast">Owner access only.</p>;
  }
  const self = (await auth()).userId;
  const { data: users } = await (await clerkClient()).users.getUserList({ limit: 100, orderBy: "-created_at" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/admin/sales" className="text-sm font-medium underline underline-offset-4">Back to the dashboard</Link>
      <h1 className="mt-4 font-display text-4xl font-semibold">Admin access</h1>
      <p className="mt-3 text-roast">Admins are trusted staff. Admins can moderate reviews and update order status. An admin never gets owner permissions: they cannot open sales, profit, expenses, payments or reports. The owner role can only be given in the Clerk dashboard.</p>
      <ul className="mt-8 divide-y divide-latte rounded-2xl border border-latte bg-paper">
        {users.map((u) => {
          const role = u.publicMetadata?.role;
          const email = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ?? "No email";
          return (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium">{[u.firstName, u.lastName].filter(Boolean).join(" ") || email}</p>
                <p className="text-sm text-roast">{email}</p>
              </div>
              {role === "owner" || u.id === self ? (
                <span className="rounded-full bg-latte px-3 py-1 text-sm font-semibold">{role === "owner" ? "Owner" : "You"}</span>
              ) : (
                <form action={setAdminRole.bind(null, u.id, role !== "admin")}>
                  <button type="submit" className={`btn min-h-9 px-4 py-1.5 ${role === "admin" ? "btn-ghost" : "btn-gold"}`}>{role === "admin" ? "Remove admin" : "Make admin"}</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function AccessPage() {
  return (
    <Suspense fallback={<p className="px-4 py-24 text-center text-roast">Loading…</p>}>
      <Access />
    </Suspense>
  );
}
