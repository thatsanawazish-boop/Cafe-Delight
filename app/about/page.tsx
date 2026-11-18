import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cafe } from "@/lib/config";

export const metadata: Metadata = { title: "About us" };

// Sample copy: rewrite it with the cafe's real story.
const values = [
  { title: "Our passion for food", text: "From a quick coffee to a family-sized pizza, we want every order to taste like it was made for you." },
  { title: "Our quality promise", text: "We care about every order. If something isn’t right, tell us and we will put it right." },
  { title: "Why customers love us", text: "A comfortable space with indoor seating, a big menu and quick, simple ordering." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">About {cafe.name}</h1>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="max-w-prose space-y-5 text-lg leading-relaxed">
          <p>{cafe.name} is a relaxed cafe for burgers, shawarma, pizza, sandwiches, shakes and coffee. It is self-service: order at the counter, pay first and collect your food at the pickup point.</p>
          <p>Prefer to skip the queue? Build your order on this website and send it to us on WhatsApp for pickup or delivery.</p>
        </div>
        <div className="relative min-h-64 overflow-hidden rounded-3xl">
          <Image src="/images/interior-mural.jpg" alt="Inside the cafe: seating, the counter and a vintage car mural on the brick wall" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
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
