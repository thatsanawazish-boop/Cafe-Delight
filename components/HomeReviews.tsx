import Link from "next/link";
import { connection } from "next/server";
import Reveal from "./Reveal";
import Stars from "./Stars";
import { formatDate, getApproved, summarize } from "@/lib/reviews";

/** Home-page reviews: the three newest approved reviews, or an invitation to write the first one. */
export default async function HomeReviews() {
  await connection();
  const list = await getApproved();
  const { count, average } = summarize(list);
  return (
    <Reveal className="mx-auto max-w-6xl px-4 pt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">What customers say</h2>
          {count > 0 && (
            <p className="mt-2 flex items-center gap-2 text-roast">
              <Stars value={Math.round(average)} />
              {average.toFixed(1)} from {count} {count === 1 ? "review" : "reviews"}
            </p>
          )}
        </div>
        <Link href="/reviews" className="btn btn-gold">
          {count > 0 ? "Read all reviews" : "Write the first review"}
        </Link>
      </div>
      {count > 0 ? (
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {list.slice(0, 3).map((r) => (
            <figure key={r.id} className="border-l-2 border-gold pl-5">
              <Stars value={r.stars} />
              <blockquote className="mt-3 font-display text-lg leading-snug">“{r.text}”</blockquote>
              <figcaption className="mt-3 text-sm text-roast">
                {r.name}, {formatDate(r.createdAt)}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="mt-4 max-w-xl text-roast">No reviews yet. Visited us? Tell other customers what you thought.</p>
      )}
    </Reveal>
  );
}
