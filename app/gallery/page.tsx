import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Gallery" };

// Photos live in /public/images. Swap any file for a better photo of the same place.
const shots: { label: string; image: string; size?: string; pos?: string }[] = [
  { label: "Storefront", image: "/images/storefront.jpg", size: "sm:col-span-2 sm:row-span-2", pos: "object-[50%_22%]" },
  { label: "Brick wall mural", image: "/images/interior-mural.jpg" },
  { label: "Green wall corner", image: "/images/green-wall.jpg" },
  { label: "Staircase and lamp", image: "/images/staircase.jpg" },
  { label: "Counter", image: "/images/counter.jpg" },
  { label: "Window seating", image: "/images/window-seating.jpg", size: "sm:col-span-2" },
  { label: "Table for two", image: "/images/table-for-two.jpg" },
  { label: "Burger and fries", image: "/images/burger-fries.jpg" },
];

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Gallery</h1>
      <p className="mt-3 max-w-xl text-roast">A look at the cafe inside and out.</p>
      <div className="mt-8 grid auto-rows-[12rem] gap-4 sm:grid-cols-4">
        {shots.map((s) => (
          <figure key={s.label} className={`group relative overflow-hidden rounded-2xl bg-latte ${s.size ?? ""}`}>
            <Image src={s.image} alt={`${s.label} at the cafe`} fill sizes="(min-width: 640px) 25vw, 100vw" className={`object-cover transition-transform duration-500 group-hover:scale-105 ${s.pos ?? ""}`} />
            <figcaption className="absolute inset-x-0 bottom-0 bg-espresso/70 px-4 py-2 text-sm font-medium text-cream">{s.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
