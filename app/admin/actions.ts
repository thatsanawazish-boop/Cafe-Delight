"use server";

import { revalidatePath } from "next/cache";
import { getRole } from "@/lib/owner-auth";
import { deleteReview, setStatus, type ReviewStatus } from "@/lib/reviews";
import { orderStatusLabels, type OrderStatus } from "@/lib/sales";
import { db } from "@/lib/supabase";

// Server actions are public endpoints, so each one checks the Clerk role itself.
async function staff() {
  const role = await getRole(); // "owner" or "admin"
  if (!role) throw new Error("Staff access required.");
  return role;
}
const refresh = () => ["/admin", "/reviews", "/"].forEach((p) => revalidatePath(p));

export async function moderate(id: string, status: ReviewStatus) {
  await staff();
  if (!["pending", "approved", "rejected"].includes(status)) return;
  await setStatus(id, status);
  refresh();
}

export async function removeReview(id: string) {
  await staff();
  await deleteReview(id);
  refresh();
}

/** Staff can move an order between Pending, Completed and Cancelled. They cannot touch payments. */
export async function setOrderStatus(id: string, status: OrderStatus) {
  const role = await staff();
  if (!Object.prototype.hasOwnProperty.call(orderStatusLabels, status)) return;
  let q = db().from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (role !== "owner") q = q.gte("created_at", new Date(Date.now() - 3 * 86_400_000).toISOString()); // admins: recent orders only
  const { error } = await q;
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}
