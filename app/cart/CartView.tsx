"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Price, Thumb } from "@/components/ProductCard";
import { MAX_QTY, useCart } from "@/lib/cart";
import { cafe } from "@/lib/config";
import { subtotal, toItems } from "@/lib/order";
import { finalPrice, formatINR, type Product } from "@/lib/products";

export default function CartView({ products }: { products: Product[] }) {
  const { lines, ready, setQty, remove } = useCart();
  const items = toItems(lines, products);
  const stale = lines.filter((l) => !items.some((i) => i.product.id === l.id));
  const total = subtotal(items);

  if (!ready) {
    return (
      <p role="status" className="px-4 py-24 text-center text-roast">
        Loading your cart…
      </p>
    );
  }

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">Your cart is empty</h1>
        <p className="mt-3 text-roast">Add a few dishes from the menu and they will show up here.</p>
        <Link href="/menu" className="btn btn-gold mt-8">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">Your cart</h1>

      {stale.length > 0 && (
        <div role="alert" className="mt-6 rounded-xl border border-gold bg-paper p-4 text-sm">
          {stale.length === 1 ? "One item is" : `${stale.length} items are`} no longer available and not counted in your total.
          <button type="button" onClick={() => stale.forEach((l) => remove(l.id))} className="ml-2 font-semibold underline">
            Remove {stale.length === 1 ? "it" : "them"}
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ul className="divide-y divide-latte border-y border-latte">
          {items.map(({ product: p, qty }) => (
            <li key={p.id} className="flex gap-4 py-5">
              <Thumb p={p} />
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-lg font-semibold">{p.name}</p>
                  <Price p={p} className="text-sm" />
                </div>
                <div className="flex items-center gap-3">
                  <div role="group" aria-label={`Quantity of ${p.name}`} className="flex items-center rounded-full border border-latte">
                    <button type="button" aria-label={`Decrease ${p.name}`} disabled={qty <= 1} onClick={() => setQty(p.id, qty - 1)} className="grid size-10 place-items-center disabled:opacity-40">
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="w-8 text-center tabular-nums" aria-live="polite">
                      {qty}
                    </span>
                    <button type="button" aria-label={`Increase ${p.name}`} disabled={qty >= MAX_QTY} onClick={() => setQty(p.id, qty + 1)} className="grid size-10 place-items-center disabled:opacity-40">
                      <Plus className="size-4" aria-hidden />
                    </button>
                  </div>
                  <p className="w-20 text-right font-semibold tabular-nums">{formatINR(finalPrice(p) * qty)}</p>
                  <button type="button" aria-label={`Remove ${p.name}`} onClick={() => remove(p.id)} className="grid size-10 place-items-center rounded-full hover:bg-latte">
                    <Trash2 className="size-5" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-latte bg-paper p-6">
          <h2 className="font-display text-xl font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatINR(total)}</dd>
            </div>
            <div className="flex justify-between border-t border-latte pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatINR(total)}</dd>
            </div>
          </dl>
          {cafe.deliveryFee > 0 && <p className="mt-3 text-xs text-roast">A delivery fee of {formatINR(cafe.deliveryFee)} is added at checkout for delivery orders.</p>}
          {items.length ? (
            <Link href="/checkout" className="btn btn-gold mt-6 w-full">
              Proceed to checkout
            </Link>
          ) : (
            <button type="button" disabled className="btn btn-gold mt-6 w-full">
              Proceed to checkout
            </button>
          )}
          <Link href="/menu" className="btn btn-ghost mt-3 w-full">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
