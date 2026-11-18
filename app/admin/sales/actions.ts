"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { ownerUserId } from "@/lib/owner-auth";
import { products } from "@/lib/products";
import { expenseLabels, orderStatusLabels, paymentMethods, paymentStatusLabels } from "@/lib/sales";
import { db } from "@/lib/supabase";

// Server actions are public endpoints, so every one re-checks the owner role itself.
async function owner() {
  const id = await ownerUserId();
  if (!id) throw new Error("Owner access required.");
  return id;
}
const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};
const done = () => revalidatePath("/admin/sales");
const has = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

export async function updateOrder(fd: FormData) {
  await owner();
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  const payment_status = String(fd.get("payment_status") ?? "");
  const payment_method = String(fd.get("payment_method") ?? "");
  if (!id || !has(orderStatusLabels, status) || !has(paymentStatusLabels, payment_status) || !paymentMethods.includes(payment_method as never)) return;
  fail((await db().from("orders").update({ status, payment_status, payment_method, updated_at: new Date().toISOString() }).eq("id", id)).error);
  done();
}

export async function addExpense(fd: FormData) {
  const uid = await owner();
  const date = String(fd.get("date") ?? "");
  const category = String(fd.get("category") ?? "");
  const amount = Number(fd.get("amount"));
  const description = String(fd.get("description") ?? "").trim().slice(0, 200);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !has(expenseLabels, category) || !Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) return;
  fail((await db().from("expenses").insert({ expense_date: date, category, amount, description: description || null, created_by: uid })).error);
  done();
}

export async function deleteExpense(id: string) {
  await owner();
  fail((await db().from("expenses").delete().eq("id", id)).error);
  done();
}

export async function saveCosts(fd: FormData) {
  await owner();
  const known = new Set(products.map((p) => p.id));
  const rows: { product_id: string; cost_price: number; updated_at: string }[] = [];
  for (const [key, value] of fd.entries()) {
    if (!key.startsWith("cost:") || typeof value !== "string" || value.trim() === "") continue;
    const product_id = key.slice(5);
    const cost = Number(value);
    if (known.has(product_id) && Number.isFinite(cost) && cost >= 0 && cost <= 100_000) rows.push({ product_id, cost_price: cost, updated_at: new Date().toISOString() });
  }
  if (rows.length) fail((await db().from("product_costs").upsert(rows)).error);
  done();
}

/** Owner only. Owners themselves are set in the Clerk dashboard, never from this app. */
export async function setAdminRole(userId: string, makeAdmin: boolean) {
  const self = await owner();
  if (userId === self) return;
  const client = await clerkClient();
  const target = await client.users.getUser(userId);
  if (target.publicMetadata?.role === "owner") return;
  await client.users.updateUserMetadata(userId, { publicMetadata: { role: makeAdmin ? "admin" : null } });
  revalidatePath("/admin/sales/access");
}
