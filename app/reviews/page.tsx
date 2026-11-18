import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import Stars from "@/components/Stars";
import { formatDate, getApproved, summarize } from "@/lib/reviews";
import ReviewForm from "./ReviewForm";

export const metadata: Metadata = { title: "Reviews" };

async function ReviewList() {
  await connection();
  const list = await getApproved();
  const { count, average } = summarize(list);

  if (count === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gold p-10 text-center">
        <p className="font-display text-2xl font-semibold">No reviews yet</p>
        <p className="mt-2 text-roast">Be the first to share how your visit went.</p>
        <a href="#write" className="btn btn-gold mt-6">
          Write a review
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <p className="font-display text-5xl font-semibold tabular-nums">{average.toFixed(1)}</p>
        <div>
          <Stars value={Math.round(average)} className="size-5" />
          <p className="mt-1 text-sm text-roast">
            Based on {count} {count === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>
      <ul className="mt-8 space-y-8">
        {list.map((r, i) => (
          <li key={r.id} className="hero-in border-l-2 border-gold pl-5" style={{ "--d": `${Math.min(i, 8) * 70}ms` } as React.CSSProperties}>
            <Stars value={r.stars} />
            <p className="mt-2 whitespace-pre-line text-lg">{r.text}</p>
            <p className="mt-2 text-sm text-roast">
              {r.name}, {formatDate(r.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="hero-in font-display text-4xl font-semibold sm:text-5xl">Customer reviews</h1>
      <p className="hero-in mt-3 max-w-xl text-roast [--d:120ms]">Every review here was sent by a customer through this page. The cafe checks each one before it appears and never adds reviews of its own.</p>
      <a href="#write" className="btn btn-gold mt-6 lg:hidden">
        Write a review
      </a>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Suspense fallback={<p className="text-roast">Loading reviews…</p>}>
            <ReviewList />
          </Suspense>
        </div>
        <div id="write" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
