import Image from "next/image";
import Link from "next/link";
import { ChefHat, Heart, Leaf, Mail, MapPin, Phone, Truck } from "lucide-react";
import { Suspense } from "react";
import HomeReviews from "@/components/HomeReviews";
import Leader from "@/components/Leader";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { cafe } from "@/lib/config";
import { categories, finalPrice, formatINR, getProducts } from "@/lib/products";

const reasons = [
  { icon: Leaf, title: "Freshly prepared", text: "Burgers, shawarma, pizza and sandwiches are made when you order them." },
  { icon: ChefHat, title: "Something for every craving", text: "From a quick coffee to a family feast pizza, there is plenty to choose from." },
  { icon: Truck, title: "Pickup or delivery", text: "Collect your order at the cafe or ask for it to be delivered." },
  { icon: Heart, title: "Simple ordering", text: "Build your cart here and send it to us on WhatsApp in one tap." },
];

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured && p.available).slice(0, 4);
  const offers = products.filter((p) => p.offer && p.available).slice(0, 4);
  const startingAt = (id: string) => {
    const prices = products.filter((p) => p.category === id && p.available).map((p) => finalPrice(p));
    return prices.length ? `from ${formatINR(Math.min(...prices))}` : "coming soon";
  };

  return (
    <>
      <section className="bg-espresso text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <h1 className="hero-in font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">{cafe.tagline}</h1>
            <p className="hero-in mt-6 max-w-lg text-lg text-cream/80 [--d:140ms]">
              {cafe.name} serves burgers, shawarma, pizza, sandwiches, shakes and coffee. Choose what you like, add it to your cart and send your order to us on WhatsApp.
            </p>
            <div className="hero-in mt-8 flex flex-wrap gap-3 [--d:280ms]">
              <Link href="/menu" className="btn btn-gold">
                Explore Menu
              </Link>
              <a href="#featured" className="btn btn-light">
                Order Now
              </a>
            </div>
          </div>
          {cafe.heroImage && (
            <div className="hero-in [--d:200ms] relative aspect-[4/5] max-h-[34rem] w-full overflow-hidden rounded-3xl">
              <Image src={cafe.heroImage} alt={`The lit ${cafe.name} sign above the cafe entrance`} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-[50%_25%]" />
            </div>
          )}
        </div>
      </section>

      <Reveal className="mx-auto max-w-6xl px-4 pt-20">
        <div className="rounded-3xl border border-latte bg-paper p-7 sm:p-10">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">On the menu</h2>
          <div className="mt-8 grid gap-x-14 gap-y-4 md:grid-cols-2">
            {categories.map((c) => (
              <Leader
                key={c.id}
                label={
                  <span>
                    <span aria-hidden>{c.emoji}</span> {c.label}
                  </span>
                }
                value={startingAt(c.id)}
              />
            ))}
          </div>
          <Link href="/menu" className="btn btn-gold mt-8">
            See the full menu
          </Link>
        </div>
      </Reveal>

      {featured.length > 0 && (
        <Reveal id="featured" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">From our menu</h2>
          <p className="mt-2 max-w-xl text-roast">A small selection. The full menu has much more.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </Reveal>
      )}

      {offers.length > 0 && (
        <Reveal className="mx-auto max-w-6xl px-4 pt-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Special offers</h2>
          <p className="mt-2 max-w-xl text-roast">Prices shown already include the discount.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {offers.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </Reveal>
      )}

      <Reveal className="mx-auto max-w-6xl px-4 pt-20">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Why choose {cafe.name}</h2>
        <ul className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {reasons.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 border-t border-latte pt-6">
              <Icon className="mt-1 size-6 shrink-0 text-gold" aria-hidden />
              <div>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="mt-1 text-roast">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      <Suspense fallback={null}>
        <HomeReviews />
      </Suspense>

      <Reveal className="mx-auto mt-20 max-w-6xl px-4">
        <div className="grid gap-10 rounded-3xl bg-latte/50 p-8 sm:p-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold">Opening hours</h2>
            <div className="mt-5 space-y-3">
              {cafe.hours.map(([days, time]) => (
                <Leader key={days} label={days} value={time} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold">Find us</h2>
            <p className="mt-5 flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
              {cafe.address}
            </p>
            <p className="mt-3 flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
              {cafe.phone}
            </p>
            <p className="mt-3 flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
              {cafe.email}
            </p>
            <Link href="/contact" className="btn btn-gold mt-6">
              Contact us
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
