import { cafe } from "./config";
import { finalPrice, formatINR, type Product } from "./products";
import type { CartLine } from "./cart";

export type OrderType = "pickup" | "delivery";
export type PaymentMethod = "cash" | "upi" | "online";
export const paymentLabels: Record<PaymentMethod, string> = { cash: "Cash", upi: "UPI", online: "Online payment" };
export type Customer = { name: string; phone: string; type: OrderType; address: string; notes: string; payment: PaymentMethod };
export type CartItem = { product: Product; qty: number };
export type Errors = Partial<Record<"name" | "phone" | "address", string>>;

/** Matches cart lines to the current menu; unknown or sold-out dishes are left out. */
export function toItems(lines: CartLine[], products: Product[]): CartItem[] {
  return lines.flatMap((l) => {
    const product = products.find((p) => p.id === l.id);
    return product?.available ? [{ product, qty: l.qty }] : [];
  });
}

export const subtotal = (items: CartItem[]) => items.reduce((sum, i) => sum + finalPrice(i.product) * i.qty, 0);
export const orderTotal = (items: CartItem[], type: OrderType) => subtotal(items) + (type === "delivery" ? cafe.deliveryFee : 0);

/** "+91 98765 43210", "09876543210" and "9876543210" all become "9876543210". */
export function normalizePhone(input: string) {
  const d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) return d.slice(2);
  if (d.length === 11 && d.startsWith("0")) return d.slice(1);
  return d;
}

export function validateOrder(c: Customer): Errors {
  const errors: Errors = {};
  if (c.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(normalizePhone(c.phone))) errors.phone = "Enter a valid 10-digit mobile number.";
  if (c.type === "delivery" && c.address.trim().length < 10) errors.address = "Enter your full delivery address, including area and landmark.";
  return errors;
}

export function buildOrderMessage(items: CartItem[], c: Customer, orderNo?: string): string {
  const delivery = c.type === "delivery";
  const rows = items.map((i, n) => {
    const unit = finalPrice(i.product);
    return `${n + 1}. ${i.product.name} – ${i.qty} × ${formatINR(unit)} = ${formatINR(unit * i.qty)}`;
  });
  return [
    `*New order${orderNo ? ` ${orderNo}` : ""} – ${cafe.name}*`,
    "",
    `Name: ${c.name.trim()}`,
    `Phone: +91 ${normalizePhone(c.phone)}`,
    `Order type: ${delivery ? "Delivery" : "Pickup"}`,
    `Payment method: ${paymentLabels[c.payment]}`,
    ...(delivery ? [`Address: ${c.address.trim()}`] : []),
    ...(c.notes.trim() ? [`Instructions: ${c.notes.trim()}`] : []),
    "",
    "*Items*",
    ...rows,
    ...(delivery && cafe.deliveryFee > 0 ? [`Delivery fee: ${formatINR(cafe.deliveryFee)}`] : []),
    "",
    `*Total: ${formatINR(orderTotal(items, c.type))}*`,
    "",
    "Please confirm my order. Thank you!",
  ].join("\n");
}

export const whatsappReady = (number: string = cafe.whatsappNumber) => /^\d{10,15}$/.test(number);
export const whatsappUrl = (text: string, number: string = cafe.whatsappNumber) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
