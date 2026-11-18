// Sales data and calculations. Everything is computed on the server from real orders and expenses.
// Rules: cancelled orders are never counted as sales; money counts as COLLECTED only when the
// order is not cancelled AND its payment_status is "verified".
import { cafe } from "./config";
import { paymentLabels, type PaymentMethod } from "./order";
import { categories } from "./products";
import { toYmd, type Range } from "./dates";
import { db } from "./supabase";

export type PaymentStatus = "unpaid" | "verified" | "failed" | "refunded";
export type OrderStatus = "pending" | "completed" | "cancelled";
export type ExpenseCategory = "purchase" | "ingredients" | "operating" | "delivery";

export const paymentMethods = Object.keys(paymentLabels) as PaymentMethod[];
export const paymentStatusLabels: Record<PaymentStatus, string> = { unpaid: "Not verified", verified: "Verified", failed: "Failed", refunded: "Refunded" };
export const orderStatusLabels: Record<OrderStatus, string> = { pending: "Pending", completed: "Completed", cancelled: "Cancelled" };
export const expenseLabels: Record<ExpenseCategory, string> = { purchase: "Product purchase cost", ingredients: "Cost of ingredients", operating: "Operating expenses", delivery: "Delivery expenses" };

export type OrderItem = { product_id: string; product_name: string; category: string; qty: number; list_price: number; unit_price: number; unit_cost: number | null };
export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  order_type: "pickup" | "delivery";
  address: string | null;
  notes: string | null;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  created_at: string;
  order_items: OrderItem[];
};
export type Expense = { id: string; expense_date: string; category: ExpenseCategory; description: string | null; amount: number };

export const orderNo = (n: number) => `CD-${n}`;
export const inr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// ---- Reading from Supabase (PostgREST returns at most 1000 rows per request, so read in pages) ----
async function paged<T>(page: (a: number, b: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const out: T[] = [];
  for (let a = 0; ; a += 1000) {
    const { data, error } = await page(a, a + 999);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}

export const fetchOrders = (r: Range) =>
  paged<Order>((a, b) =>
    db().from("orders").select("*, order_items(*)").gte("created_at", r.start.toISOString()).lt("created_at", r.end.toISOString()).order("created_at", { ascending: false }).order("order_number", { ascending: false }).range(a, b),
  );

export const fetchExpenses = (r: Range) =>
  paged<Expense>((a, b) => db().from("expenses").select("*").gte("expense_date", r.from).lte("expense_date", r.to).order("expense_date", { ascending: false }).order("created_at", { ascending: false }).range(a, b));

export async function fetchCosts(): Promise<Record<string, number>> {
  const rows = await paged<{ product_id: string; cost_price: number }>((a, b) => db().from("product_costs").select("*").range(a, b));
  return Object.fromEntries(rows.map((r) => [r.product_id, Number(r.cost_price)]));
}

// ---- Calculations ----
const live = (o: Order) => o.status !== "cancelled";
const received = (o: Order) => live(o) && o.payment_status === "verified";
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const r2 = (n: number) => Math.round(n * 100) / 100;

export function summarize(orders: Order[]) {
  const l = orders.filter(live);
  const rec = orders.filter(received);
  const booked = sum(l.map((o) => o.total));
  return {
    orders: orders.length,
    completed: orders.filter((o) => o.status === "completed").length,
    pending: orders.filter((o) => o.status === "pending").length,
    cancelled: orders.length - l.length,
    booked: r2(booked), // value of orders placed, cancelled excluded
    collected: r2(sum(rec.map((o) => o.total))), // verified payments only
    notVerified: r2(sum(l.filter((o) => o.payment_status !== "verified").map((o) => o.total))),
    avgOrder: l.length ? r2(booked / l.length) : 0,
    discounts: r2(sum(l.map((o) => o.discount))),
    deliveryCollected: r2(sum(rec.map((o) => o.delivery_fee))),
  };
}

export function dailySeries(orders: Order[], days: string[]) {
  const m = new Map(days.map((d) => [d, { day: d, booked: 0, collected: 0 }]));
  for (const o of orders) {
    const row = m.get(toYmd(o.created_at));
    if (!row || !live(o)) continue;
    row.booked += o.total;
    if (received(o)) row.collected += o.total;
  }
  return [...m.values()];
}

export function bestSellers(orders: Order[], costs: Record<string, number>) {
  const m = new Map<string, { id: string; name: string; category: string; units: number; revenue: number; cost: number; known: boolean }>();
  for (const o of orders.filter(live)) {
    for (const i of o.order_items) {
      const row = m.get(i.product_id) ?? { id: i.product_id, name: i.product_name, category: categories.find((c) => c.id === i.category)?.label ?? i.category, units: 0, revenue: 0, cost: 0, known: true };
      row.units += i.qty;
      row.revenue += i.qty * i.unit_price;
      const c = i.unit_cost ?? costs[i.product_id];
      if (c === undefined || c === null) row.known = false;
      else row.cost += i.qty * c;
      m.set(i.product_id, row);
    }
  }
  return [...m.values()]
    .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
    .map((r, n) => ({ rank: n + 1, name: r.name, category: r.category, units: r.units, revenue: r2(r.revenue), margin: r.known ? r2(r.revenue - r.cost) : null }));
}

export function paymentReport(orders: Order[]) {
  return paymentMethods.map((method) => {
    const l = orders.filter((o) => live(o) && o.payment_method === method);
    const rec = l.filter((o) => o.payment_status === "verified");
    const open = l.filter((o) => o.payment_status === "unpaid");
    return { method, orders: l.length, received: r2(sum(rec.map((o) => o.total))), receivedCount: rec.length, awaiting: r2(sum(open.map((o) => o.total))), awaitingCount: open.length };
  });
}

/** Profit is only calculated once the costs it needs have been entered. Sales are never treated as profit. */
export function profitReport(collected: number, expenses: Expense[]) {
  const by = (c: ExpenseCategory) => {
    const e = expenses.filter((x) => x.category === c);
    return { total: r2(sum(e.map((x) => Number(x.amount)))), entered: e.length > 0 };
  };
  const p = by("purchase"), g = by("ingredients"), o = by("operating"), d = by("delivery");
  const gross = p.entered || g.entered ? r2(collected - p.total - g.total) : null;
  const net = gross !== null && (o.entered || d.entered) ? r2(gross - o.total - d.total) : null;
  return { purchase: p, ingredients: g, operating: o, delivery: d, gross, net };
}

export const itemsText = (o: Order) => o.order_items.map((i) => `${i.qty} x ${i.product_name}`).join("; ");
export const timezone = cafe.timezone;
