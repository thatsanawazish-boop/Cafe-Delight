"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import type { ReviewState } from "@/lib/reviews";
import { submitReview } from "./actions";

const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
type Key = "name" | "text" | "phone" | "stars";

export default function ReviewForm() {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, {});
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const fields = state.fields ?? {};
  const values = state.values;

  if (state.ok) {
    return (
      <div role="status" className="pop-in rounded-3xl border border-gold bg-paper p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-gold" aria-hidden />
        <h2 className="mt-4 font-display text-2xl font-semibold">Thank you for your review</h2>
        <p className="mt-2 text-roast">The cafe checks every review before it goes live. Yours will appear on this page once it is approved.</p>
      </div>
    );
  }

  const error = (key: Key) =>
    fields[key] ? (
      <p id={`${key}-error`} role="alert" className="mt-1 text-sm text-red-700">
        {fields[key]}
      </p>
    ) : null;
  const aria = (key: Key) => ({ "aria-invalid": Boolean(fields[key]), "aria-describedby": fields[key] ? `${key}-error` : undefined });

  return (
    <form action={action} className="relative space-y-6 rounded-3xl border border-latte bg-paper p-6 sm:p-8">
      <h2 className="font-display text-2xl font-semibold">Write a review</h2>

      <div>
        <p id="rating-label" className="mb-1 font-medium">
          Your rating
        </p>
        <div role="radiogroup" aria-labelledby="rating-label" className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n === 1 ? "star" : "stars"}, ${labels[n - 1]}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="grid size-11 place-items-center rounded-full"
            >
              <Star aria-hidden className={`size-8 transition-transform duration-200 ${n <= (hover || rating) ? "scale-110 fill-gold text-gold" : "text-latte"}`} />
            </button>
          ))}
          <span aria-live="polite" className="ml-2 text-sm text-roast">
            {rating ? labels[rating - 1] : ""}
          </span>
        </div>
        <input type="hidden" name="stars" value={rating} />
        {error("stars")}
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block font-medium">
          Your name
        </label>
        <input id="name" name="name" autoComplete="name" maxLength={40} defaultValue={values?.name} className="field" {...aria("name")} />
        {error("name")}
      </div>

      <div>
        <label htmlFor="text" className="mb-1 block font-medium">
          Your review
        </label>
        <textarea id="text" name="text" rows={5} maxLength={600} defaultValue={values?.text} className="field" {...aria("text")} />
        {error("text")}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block font-medium">
          Mobile number (optional)
        </label>
        <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" defaultValue={values?.phone} className="field" {...aria("phone")} />
        <p className="mt-1 text-sm text-roast">Never shown on the website. The cafe may use it to confirm you are a real customer.</p>
        {error("phone")}
      </div>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-gold">
        {pending ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
