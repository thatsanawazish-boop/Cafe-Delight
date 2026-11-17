import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Gallery" };

// Add a real photo to any tile with `image: "/images/your-file.jpg"` (file goes in /public/images).
const shots: { label: string; emoji: string; tone: string; size?: string; image?: string }[] = [
  { label: "Cafe interior", emoji: "🛋️", tone: "bg-espresso text-cream", size: "sm:col-span-2 sm:row-span-2" },
  { label: "Burgers", emoji: "🍔", tone: "bg-latte" },
  { label: "Pizzas", emoji: "🍕", tone: "bg-gold/25" },
  { label: "Coffee", emoji: "☕", tone: "bg-roast text-cream" },
  { label: "Desserts", emoji: "🍰", tone: "bg-latte" },
  { label: "Drinks", emoji: "🥤", tone: "bg-gold/25", size: "sm:col-span-2" },
  { label: "Food presentation", emoji: "🍽️", tone: "bg-espresso text-cream", size: "sm:col-span-2" },
];

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Gallery</h1>
      <p className="mt-3 max-w-xl text-roast">A look at the cafe, the food and the drinks.</p>
      <div className="mt-8 grid auto-rows-[12rem] gap-4 sm:grid-cols-4">
        {shots.map((s) => (
          <figure key={s.label} className={`group relative overflow-hidden rounded-2xl ${s.tone} ${s.size ?? ""}`}>
            {s.image ? (
              <Image src={s.image} alt={s.label} fill sizes="(min-width: 640px) 25vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div aria-hidden className="grid h-full place-items-center text-7xl transition-transform duration-500 group-hover:scale-110">
                {s.emoji}
              </div>
            )}
            <figcaption className="absolute inset-x-0 bottom-0 bg-espresso/70 px-4 py-2 text-sm font-medium text-cream">{s.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
