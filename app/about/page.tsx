import type { Metadata } from "next";
import Link from "next/link";
import { cafe } from "@/lib/config";

export const metadata: Metadata = { title: "About us" };

// Sample copy: rewrite it with the cafe's real story.
const values = [
  { title: "Our passion for food", text: "Food is why we are here. We love a crisp burger, a properly stretched pizza and a coffee pulled with care, and we want you to taste that in every order." },
  { title: "Our quality promise", text: "Fresh ingredients, clean kitchens and honest prices. If something isn’t right with your order, tell us and we will put it right." },
  { title: "Why customers love us", text: "Generous portions, friendly service and a menu with something for everyone, from vegetarians to confirmed coffee lovers." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">About {cafe.name}</h1>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="max-w-prose space-y-5 text-lg leading-relaxed">
          <p>{cafe.name} is a neighbourhood cafe for people who like their food hot, their coffee strong and their evenings unhurried. The menu runs from a quick espresso to a full pizza night, so there is always something for the table.</p>
          <p>We keep the menu focused so every dish gets the attention it deserves, and we make ordering as easy as sending a message.</p>
        </div>
        <div aria-hidden className="grid min-h-56 place-items-center rounded-3xl bg-latte/60 text-8xl">
          ☕
        </div>
      </div>
      <div className="mt-16 grid gap-10 md:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="border-t-2 border-gold pt-5">
            <h2 className="font-display text-2xl font-semibold">{v.title}</h2>
            <p className="mt-3 text-roast">{v.text}</p>
          </div>
        ))}
      </div>
      <Link href="/menu" className="btn btn-gold mt-14">
        See what’s on the menu
      </Link>
    </div>
  );
}
