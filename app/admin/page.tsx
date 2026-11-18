import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import Stars from "@/components/Stars";
import { clerkConfigured, getRole } from "@/lib/owner-auth";
import { formatDate, getAllReviews, summarize, type ReviewStatus } from "@/lib/reviews";
import { moderate, removeReview } from "./actions";
import ConfirmButton from "./ConfirmButton";
import StaffNav from "./StaffNav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const tabs = [
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["all", "All"],
] as const;

const badge: Record<ReviewStatus, string> = {
  pending: "bg-brass/30 text-espresso",
  approved: "bg-green-100 text-green-900",
  rejected: "bg-red-100 text-red-900",
};

const note = (title: string, text: string) => (
  <div className="mx-auto max-w-xl px-4 py-20">
    <h1 className="font-display text-3xl font-semibold">{title}</h1>
    <p className="mt-3 text-roast">{text}</p>
  </div>
);

async function AdminContent({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await connection();
  if (!clerkConfigured()) return note("Set up the staff login", "Add the Clerk keys to .env.local and restart the server. The README has the steps.");
  const role = await getRole();
  if (!role) return note("Staff access only", "Sign in with an account that the owner has made an admin.");

  const { status } = await searchParams;
  const filter = tabs.find(([k]) => k === status)?.[0] ?? "pending";
  const all = await getAllReviews();
  const { average } = summarize(all.filter((r) => r.status === "approved"));
  const countOf = (k: string) => (k === "all" ? all.length : all.filter((r) => r.status === k).length);
  const shown = filter === "all" ? all : all.filter((r) => r.status === filter);

  const stats = [
    ["Total reviews", String(all.length)],
    ["Waiting for approval", String(countOf("pending"))],
    ["Live on the website", String(countOf("approved"))],
    ["Average rating", countOf("approved") ? average.toFixed(1) : "No ratings yet"],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold">Review dashboard</h1>
        <StaffNav role={role} />
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value], i) => (
          <div key={label} className="hero-in rounded-2xl border border-latte bg-paper p-5" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
            <dt className="text-sm text-roast">{label}</dt>
            <dd className="mt-1 font-display text-3xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label="Filter reviews" className="mt-10 flex flex-wrap gap-2">
        {tabs.map(([key, label]) => (
          <Link key={key} href={`/admin?status=${key}`} aria-current={filter === key ? "page" : undefined} className={`rounded-full border px-4 py-2 text-sm font-medium ${filter === key ? "border-espresso bg-espresso text-cream" : "border-latte bg-paper hover:border-gold"}`}>
            {label} ({countOf(key)})
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-gold p-10 text-center text-roast">No {filter === "all" ? "" : `${filter} `}reviews to show.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {shown.map((r) => (
            <li key={r.id} className="rounded-2xl border border-latte bg-paper p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Stars value={r.stars} />
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge[r.status]}`}>{r.status}</span>
                </div>
                <time dateTime={r.createdAt} className="text-sm text-roast">
                  {formatDate(r.createdAt)}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-line">{r.text}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-roast">
                <span className="font-medium text-espresso">{r.name}</span>
                {r.phone ? (
                  <a href={`https://wa.me/91${r.phone}`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-gold">
                    +91 {r.phone} (verify on WhatsApp)
                  </a>
                ) : (
                  <span>No phone number given</span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "approved" && (
                  <form action={moderate.bind(null, r.id, "approved")}>
                    <button type="submit" className="btn btn-gold min-h-9 px-4 py-1.5">Approve</button>
                  </form>
                )}
                {r.status !== "rejected" && (
                  <form action={moderate.bind(null, r.id, "rejected")}>
                    <button type="submit" className="btn btn-ghost min-h-9 px-4 py-1.5">Reject</button>
                  </form>
                )}
                <form action={removeReview.bind(null, r.id)}>
                  <ConfirmButton message="Delete this review permanently?" className="btn min-h-9 px-4 py-1.5 text-red-700 hover:bg-red-50">
                    Delete
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-24 text-center text-roast">Loading…</p>}>
      <AdminContent searchParams={searchParams} />
    </Suspense>
  );
}
