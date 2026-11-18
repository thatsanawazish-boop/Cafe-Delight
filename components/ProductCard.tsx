"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import { categories, finalPrice, formatINR, type Product } from "@/lib/products";

const emojiOf = (p: Product) => categories.find((c) => c.id === p.category)?.emoji;

export function VegMark({ veg }: { veg: boolean }) {
  const label = veg ? "Vegetarian" : "Non-vegetarian";
  return (
    <span role="img" aria-label={label} title={label} className={`inline-grid size-4 shrink-0 place-items-center rounded-[3px] border-2 bg-white ${veg ? "border-green-700" : "border-red-700"}`}>
      <span className={`size-2 rounded-full ${veg ? "bg-green-700" : "bg-red-700"}`} />
    </span>
  );
}

export function Price({ p, className = "" }: { p: Product; className?: string }) {
  return (
    <span className={`tabular-nums ${className}`}>
      <span className="font-semibold">{formatINR(finalPrice(p))}</span>
      {p.offer ? <s className="ml-2 text-sm opacity-60">{formatINR(p.price)}</s> : null}
    </span>
  );
}

/** Dish photo with badges. Shows the category emoji until the dish has an `image`. */
export function ProductImage({ p, className = "" }: { p: Product; className?: string }) {
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-latte/60 ${className}`}>
      {p.image ? (
        <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
      ) : (
        <span className="text-6xl" aria-hidden>
          {emojiOf(p)}
        </span>
      )}
      {p.offer ? <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-white">{p.offer}% off</span> : null}
      {!p.available && <span className="absolute inset-0 grid place-items-center bg-espresso/60 font-semibold text-cream">Sold out</span>}
    </div>
  );
}

export function Thumb({ p }: { p: Product }) {
  return (
    <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-latte/60 text-3xl">
      {p.image ? <Image src={p.image} alt="" fill sizes="64px" className="object-cover" /> : <span aria-hidden>{emojiOf(p)}</span>}
    </div>
  );
}

export default function ProductCard({ p, onOpen }: { p: Product; onOpen?: (p: Product) => void }) {
  const { add } = useCart();
  const media = <ProductImage p={p} className="aspect-[4/3]" />;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-latte bg-paper hover:border-gold">
      {onOpen ? (
        <button type="button" onClick={() => onOpen(p)} aria-label={`View details: ${p.name}`} className="block text-left">
          {media}
        </button>
      ) : (
        media
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-snug">{p.name}</h3>
          <VegMark veg={p.veg} />
        </div>
        {p.description && <p className="line-clamp-2 text-sm text-roast">{p.description}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          <Price p={p} className="text-lg" />
          <button
            type="button"
            disabled={!p.available}
            onClick={() => add(p.id)}
            aria-label={p.available ? `Add ${p.name} to cart` : `${p.name} is sold out`}
            className="btn btn-gold min-h-10 px-4"
          >
            <Plus className="size-4" aria-hidden />
            {p.available ? "Add" : "Sold out"}
          </button>
        </div>
      </div>
    </article>
  );
}
