import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { clerkConfigured, getRole } from "@/lib/owner-auth";
import { addDays, fmtDateTime, resolveRange, toYmd } from "@/lib/dates";
import { paymentLabels } from "@/lib/order";
import { fetchOrders, inr, orderNo, paymentStatusLabels, type Order } from "@/lib/sales";
import { supabaseReady } from "@/lib/supabase";
import { setOrderStatus } from "../actions";
import ConfirmButton from "../ConfirmButton";
import StaffNav from "../StaffNav";

export const metadata: Metadata = { title: "Orders", robots: { index: false, follow: false } };

const note = (text: string) => <p className="px-4 py-24 text-center text-roast">{text}</p>;

function OrderCard({ o }: { o: Order }) {
  const pending = o.status === "pending";
  return (
    <li className="rounded-2xl border border-latte bg-paper p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-xl font-semibold">{orderNo(o.order_number)}</p>
        <p className="text-sm text-roast">{fmtDateTime(o.created_at)}</p>
      </div>
      <p className="mt-2 font-medium">{o.customer_name} <span className="font-normal text-roast">{o.customer_phone}</span></p>
      <p className="text-sm text-roast">{o.order_type === "delivery" ? `Delivery${o.address ? `: ${o.address}` : ""}` : "Pickup"}</p>
      <ul className="mt-3 space-y-1">
        {o.order_items.map((i) => (
          <li key={`${o.id}-${i.product_id}`}>{i.qty} × {i.product_name}</li>
        ))}
      </ul>
      {o.notes && <p className="mt-3 rounded-xl bg-latte/50 p-3 text-sm">Customer note: {o.notes}</p>}
      <p className="mt-3 text-sm text-roast">
        {inr(Number(o.total))} · {paymentLabels[o.payment_method]} · Payment: {paymentStatusLabels[o.payment_status]}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {pending ? (
          <>
            <form action={setOrderStatus.bind(null, o.id, "completed")}>
              <button type="submit" className="btn btn-gold min-h-9 px-4 py-1.5">Mark completed</button>
            </form>
            <form action={setOrderStatus.bind(null, o.id, "cancelled")}>
              <ConfirmButton message={`Cancel order ${orderNo(o.order_number)}?`} className="btn min-h-9 px-4 py-1.5 text-red-700 hover:bg-red-50">Cancel order</ConfirmButton>
            </form>
          </>
        ) : (
          <form action={setOrderStatus.bind(null, o.id, "pending")}>
            <button type="submit" className="btn btn-ghost min-h-9 px-4 py-1.5">Reopen</button>
          </form>
        )}
      </div>
    </li>
  );
}

async function Orders() {
  await connection();
  if (!clerkConfigured() || !supabaseReady()) return note("Clerk and Supabase must be set up first. See the README.");
  const role = await getRole();
  if (!role) return note("Staff access only. Ask the owner to make your account an admin.");
  const today = toYmd(new Date());
  const orders = await fetchOrders(resolveRange("custom", addDays(today, -1), today)).catch(() => null);
  if (!orders) return note("Could not read the orders. Check the Supabase setup.");
  const open = orders.filter((o) => o.status === "pending").reverse(); // oldest first, so they are made in order
  const closed = orders.filter((o) => o.status !== "pending");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold">Orders</h1>
        <StaffNav role={role} />
      </div>
      <p className="mt-2 text-sm text-roast">Orders from yesterday and today. Payments are checked by the owner, so they are shown here but cannot be changed. <Link href="/admin/orders" className="font-medium underline underline-offset-4">Refresh</Link></p>

      <h2 className="mt-10 font-display text-2xl font-semibold">Waiting to be made ({open.length})</h2>
      {open.length ? <ul className="mt-4 space-y-4">{open.map((o) => <OrderCard key={o.id} o={o} />)}</ul> : <p className="mt-4 rounded-2xl border border-dashed border-gold p-8 text-center text-roast">No pending orders right now.</p>}

      {closed.length > 0 && (
        <>
          <h2 className="mt-12 font-display text-2xl font-semibold">Completed and cancelled ({closed.length})</h2>
          <ul className="mt-4 space-y-4">{closed.map((o) => <OrderCard key={o.id} o={o} />)}</ul>
        </>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={note("Loading orders…")}>
      <Orders />
    </Suspense>
  );
}
