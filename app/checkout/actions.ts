"use server";

import { clientKey } from "@/lib/client-key";
import { cafe } from "@/lib/config";
import { orderTotal, subtotal, toItems, validateOrder, normalizePhone, type Customer } from "@/lib/order";
import { finalPrice, getProducts } from "@/lib/products";
import { db, supabaseReady } from "@/lib/supabase";
import type { CartLine } from "@/lib/cart";

const recent = new Map<string, number[]>();

/**
 * Saves the order to Supabase so it shows up in the owner's sales records. Prices are worked out here from the
 * menu, never taken from the browser. If saving fails the customer can still send the order on WhatsApp.
 */
export async function placeOrder(lines: CartLine[], c: Customer): Promise<{ orderNo?: string }> {
  if (!supabaseReady() || !Array.isArray(lines) || Object.keys(validateOrder(c)).length) return {};
  if (!["cash", "upi", "online"].includes(c.payment) || !["pickup", "delivery"].includes(c.type)) return {};

  // At most 8 orders per visitor per hour.
  const key = await clientKey();
  const now = Date.now();
  const times = (recent.get(key) ?? []).filter((t) => now - t < 3_600_000);
  if (times.length >= 8) return {};
  recent.set(key, [...times, now]);

  const clean = lines.filter((l) => typeof l?.id === "string" && Number.isInteger(l?.qty) && l.qty > 0 && l.qty <= 20);
  const items = toItems(clean, await getProducts());
  if (!items.length) return {};

  const discount = items.reduce((n, i) => n + (i.product.price - finalPrice(i.product)) * i.qty, 0);
  const { data, error } = await db().rpc("create_order", {
    p: {
      customer_name: c.name.trim().slice(0, 80),
      customer_phone: normalizePhone(c.phone),
      order_type: c.type,
      address: c.type === "delivery" ? c.address.trim().slice(0, 300) : "",
      notes: c.notes.trim().slice(0, 300),
      subtotal: subtotal(items),
      discount,
      delivery_fee: c.type === "delivery" ? cafe.deliveryFee : 0,
      total: orderTotal(items, c.type),
      payment_method: c.payment,
      items: items.map((i) => ({ product_id: i.product.id, product_name: i.product.name, category: i.product.category, qty: i.qty, list_price: i.product.price, unit_price: finalPrice(i.product) })),
    },
  });
  if (error || typeof data !== "number") {
    console.error("Could not save order:", error?.message);
    return {};
  }
  return { orderNo: `CD-${data}` };
}
