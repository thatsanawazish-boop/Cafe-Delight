"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import ProductCard, { Price, ProductImage, VegMark } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { categories, type Category, type Product } from "@/lib/products";

function Details({ p, onClose }: { p: Product; onClose: () => void }) {
  const { add } = useCart();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-espresso/60 sm:place-items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={p.name} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper sm:rounded-3xl">
        <ProductImage p={p} className="aspect-[16/10]" />
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">{p.name}</h2>
            <button type="button" autoFocus onClick={onClose} aria-label="Close details" className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-latte">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <p className="flex items-center gap-2 text-sm text-roast">
            <VegMark veg={p.veg} />
            {p.veg ? "Vegetarian" : "Non-vegetarian"}
          </p>
          <p className="text-roast">{p.description}</p>
          <p className="text-sm font-medium">{p.available ? "Available today" : "Sold out right now"}</p>
          <div className="flex items-center justify-between pt-2">
            <Price p={p} className="text-2xl" />
            <button
              type="button"
              disabled={!p.available}
              onClick={() => {
                add(p.id);
                onClose();
              }}
              className="btn btn-gold"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MenuClient({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => (category === "all" || p.category === category) && (!q || p.name.toLowerCase().includes(q)));
  }, [products, category, query]);

  const chip = (active: boolean) => `shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${active ? "border-espresso bg-espresso text-cream" : "border-latte bg-paper hover:border-gold"}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Our menu</h1>
      <p className="mt-3 max-w-xl text-roast">Pick your favourites, add them to your cart and send the order to us on WhatsApp.</p>

      <div className="relative mt-8 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-roast" aria-hidden />
        <label htmlFor="menu-search" className="sr-only">
          Search the menu
        </label>
        <input id="menu-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes, for example pizza" className="field pl-12" />
      </div>

      <div role="group" aria-label="Filter by category" className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2">
        <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")} className={chip(category === "all")}>
          All
        </button>
        {categories.map((c) => (
          <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(c.id)} className={chip(category === c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <p role="status" className="mt-6 text-sm text-roast">
        {shown.length} {shown.length === 1 ? "dish" : "dishes"}
      </p>
      {shown.length ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} p={p} onOpen={setSelected} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-gold p-10 text-center">
          <p className="font-display text-2xl font-semibold">Nothing matches “{query.trim()}”</p>
          <p className="mt-2 text-roast">Check the spelling, try a shorter word, or browse another category.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
            className="btn btn-gold mt-6"
          >
            Show the full menu
          </button>
        </div>
      )}

      {selected && <Details p={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
