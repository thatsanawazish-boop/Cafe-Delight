import Link from "next/link";
import { ChefHat, Heart, Leaf, Mail, MapPin, Phone, Star, Truck } from "lucide-react";
import Leader from "@/components/Leader";
import ProductCard from "@/components/ProductCard";
import { cafe, reviews } from "@/lib/config";
import { categories, finalPrice, formatINR, getProducts } from "@/lib/products";

const reasons = [
  { icon: Leaf, title: "Freshly prepared", text: "Burgers, pizzas and pasta are made when you order them." },
  { icon: ChefHat, title: "A menu for every mood", text: "Eight categories, from a quick espresso to a full pizza night." },
  { icon: Truck, title: "Pickup or delivery", text: "Collect your order at the cafe or have it brought to your door." },
  { icon: Heart, title: "Simple ordering", text: "Build your cart here and send it to us on WhatsApp in one tap." },
];

export default async function HomePage() {
  const products = await getProducts();
  const bestsellers = products.filter((p) => p.bestseller && p.available).slice(0, 4);
  const offers = products.filter((p) => p.offer && p.available).slice(0, 4);
  const startingAt = (id: string) => {
    const prices = products.filter((p) => p.category === id && p.available).map((p) => finalPrice(p));
    return prices.length ? `from ${formatINR(Math.min(...prices))}` : "coming soon";
  };
  const heroStyle = cafe.heroImage
    ? { backgroundImage: `linear-gradient(rgba(42,24,16,.82), rgba(42,24,16,.82)), url(${cafe.heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : undefined;

  return (
    <>
      <section className="bg-espresso text-cream" style={heroStyle}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">{cafe.tagline}</h1>
            <p className="mt-6 max-w-lg text-lg text-cream/80">
              {cafe.name} serves burgers, pizza, pasta, shakes and freshly brewed coffee. Choose what you like, add it to your cart and send your order to us on WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/menu" className="btn btn-gold">
                Explore Menu
              </Link>
              <a href="#bestsellers" className="btn btn-light">
                Order Now
              </a>
            </div>
          </div>
          <div className="rounded-3xl bg-paper p-7 text-espresso sm:p-9">
            <h2 className="font-display text-2xl font-semibold">On the menu</h2>
            <div className="mt-5 space-y-3">
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
            <Link href="/menu" className="mt-7 inline-block font-semibold underline underline-offset-4">
              See the full menu
            </Link>
          </div>
        </div>
      </section>

      <section id="bestsellers" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Bestsellers</h2>
        <p className="mt-2 max-w-xl text-roast">Good places to start if you’re not sure what to order.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Special offers</h2>
          <p className="mt-2 max-w-xl text-roast">Prices shown already include the discount.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {offers.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-20">
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
      </section>

      {reviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">What customers say</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {reviews.map((r, i) => (
              <figure key={i} className="border-l-2 border-gold pl-5">
                <div className="flex gap-0.5" role="img" aria-label={`${r.stars} out of 5 stars`}>
                  {Array.from({ length: r.stars }, (_, n) => (
                    <Star key={n} className="size-4 fill-gold text-gold" aria-hidden />
                  ))}
                </div>
                <blockquote className="mt-3 font-display text-lg leading-snug">“{r.text}”</blockquote>
                <figcaption className="mt-3 text-sm text-roast">{r.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-20 max-w-6xl px-4">
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
      </section>
    </>
  );
}
