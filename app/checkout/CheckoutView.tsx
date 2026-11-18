"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import Leader from "@/components/Leader";
import { useCart } from "@/lib/cart";
import { cafe } from "@/lib/config";
import { buildOrderMessage, paymentLabels, orderTotal, subtotal, toItems, validateOrder, whatsappReady, whatsappUrl, type Customer, type Errors } from "@/lib/order";
import { finalPrice, formatINR, type Product } from "@/lib/products";
import { placeOrder } from "./actions";

const blank: Customer = { name: "", phone: "", type: "pickup", address: "", notes: "", payment: "cash" };

export default function CheckoutView({ products }: { products: Product[] }) {
  const { lines, ready } = useCart();
  const [form, setForm] = useState<Customer>(blank);
  const [errors, setErrors] = useState<Errors>({});
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const items = toItems(lines, products);
  const canOrder = whatsappReady();
  const delivery = form.type === "delivery";

  const set = <K extends keyof Customer>(key: K, value: Customer[K]) => setForm((f) => ({ ...f, [key]: value }));
  const fieldError = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`${key}-error`} role="alert" className="mt-1 text-sm text-red-700">
        {errors[key]}
      </p>
    ) : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found = validateOrder(form);
    setErrors(found);
    if (Object.keys(found).length > 0 || !canOrder || saving) return;
    setSaving(true);
    let orderNo: string | undefined;
    try {
      orderNo = (await placeOrder(lines, form)).orderNo; // saved for the owner's sales records
    } catch {
      // The order can still be sent on WhatsApp.
    }
    setSaving(false);
    const url = whatsappUrl(buildOrderMessage(items, form, orderNo));
    setLink(url);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!ready) {
    return (
      <p role="status" className="px-4 py-24 text-center text-roast">
        Loading your order…
      </p>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">Nothing to check out yet</h1>
        <p className="mt-3 text-roast">Add dishes to your cart first, then come back to place your order.</p>
        <Link href="/menu" className="btn btn-gold mt-8">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">Checkout</h1>
      <p className="mt-3 max-w-xl text-roast">
        Enter your details and send the order to us on WhatsApp. Your order is confirmed only when {cafe.name} replies to you. No payment is taken on this site.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <form onSubmit={submit} noValidate className="space-y-6">
          <div>
            <label htmlFor="name" className="mb-1 block font-medium">
              Full name
            </label>
            <input id="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} className="field" />
            {fieldError("name")}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block font-medium">
              Mobile number
            </label>
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} className="field" />
            {fieldError("phone")}
          </div>

          <fieldset>
            <legend className="mb-2 font-medium">Order type</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["pickup", "delivery"] as const).map((t) => (
                <label key={t} className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-4 font-medium focus-within:ring-2 focus-within:ring-gold ${form.type === t ? "border-espresso bg-espresso text-cream" : "border-latte bg-paper"}`}>
                  <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => set("type", t)} className="sr-only" />
                  {t === "pickup" ? "Pickup" : "Delivery"}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-medium">Payment method</legend>
            <div className="grid grid-cols-3 gap-3">
              {(["cash", "upi", "online"] as const).map((m) => (
                <label key={m} className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-sm font-medium focus-within:ring-2 focus-within:ring-gold ${form.payment === m ? "border-espresso bg-espresso text-cream" : "border-latte bg-paper"}`}>
                  <input type="radio" name="payment" value={m} checked={form.payment === m} onChange={() => set("payment", m)} className="sr-only" />
                  {paymentLabels[m]}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-roast">Nothing is charged on this site. We mark an order as paid only after the money has reached us.</p>
          </fieldset>

          {delivery && (
            <div>
              <label htmlFor="address" className="mb-1 block font-medium">
                Delivery address
              </label>
              <textarea id="address" rows={3} autoComplete="street-address" value={form.address} onChange={(e) => set("address", e.target.value)} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? "address-error" : undefined} className="field" />
              {fieldError("address")}
            </div>
          )}

          <div>
            <label htmlFor="notes" className="mb-1 block font-medium">
              Instructions <span className="font-normal text-roast">(optional)</span>
            </label>
            <textarea id="notes" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Less spicy, extra napkins, ring the bell…" className="field" />
          </div>

          {!canOrder && (
            <p role="note" className="rounded-xl border border-gold bg-paper p-4 text-sm">
              Online ordering isn’t switched on yet because the cafe’s WhatsApp number hasn’t been added. The owner can set it in <code>lib/config.ts</code>.
            </p>
          )}

          <button type="submit" disabled={!canOrder || saving} className="btn btn-gold w-full sm:w-auto">
            <MessageCircle className="size-5" aria-hidden />
            {saving ? "Saving your order…" : "Order on WhatsApp"}
          </button>

          {link && (
            <div role="status" className="rounded-xl border border-latte bg-paper p-4 text-sm">
              WhatsApp should now be open with your order message. <strong>Your order is not confirmed yet.</strong> {cafe.name} will reply to confirm it. If nothing opened,{" "}
              <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                open WhatsApp here
              </a>
              .
            </div>
          )}

          <details className="rounded-xl border border-latte bg-paper p-4 text-sm">
            <summary className="cursor-pointer font-medium">Preview your WhatsApp message</summary>
            <pre className="mt-3 whitespace-pre-wrap break-words font-sans">{buildOrderMessage(items, form)}</pre>
          </details>
        </form>

        <aside className="h-fit rounded-2xl border border-latte bg-paper p-6">
          <h2 className="font-display text-xl font-semibold">Your order</h2>
          <div className="mt-4 space-y-3 text-sm">
            {items.map(({ product: p, qty }) => (
              <Leader key={p.id} label={`${p.name} × ${qty}`} value={formatINR(finalPrice(p) * qty)} />
            ))}
          </div>
          <dl className="mt-5 space-y-3 border-t border-latte pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatINR(subtotal(items))}</dd>
            </div>
            {delivery && cafe.deliveryFee > 0 && (
              <div className="flex justify-between">
                <dt>Delivery fee</dt>
                <dd className="tabular-nums">{formatINR(cafe.deliveryFee)}</dd>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatINR(orderTotal(items, form.type))}</dd>
            </div>
          </dl>
          <Link href="/cart" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
            Edit cart
          </Link>
        </aside>
      </div>
    </div>
  );
}
