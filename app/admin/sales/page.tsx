import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { UserButton } from "@clerk/nextjs";
import { Download } from "lucide-react";
import { clerkConfigured, getRole } from "@/lib/owner-auth";
import { dayList, fmtDateTime, rangeOptions, resolveRange, toYmd } from "@/lib/dates";
import { getProducts } from "@/lib/products";
import { paymentLabels } from "@/lib/order";
import {
  bestSellers, dailySeries, expenseLabels, fetchCosts, fetchExpenses, fetchOrders, inr, itemsText, orderNo, orderStatusLabels,
  paymentMethods, paymentReport, paymentStatusLabels, profitReport, summarize, timezone, type ExpenseCategory,
} from "@/lib/sales";
import { supabaseReady } from "@/lib/supabase";
import { addExpense, deleteExpense, saveCosts, updateOrder } from "./actions";
import SalesChart from "./SalesChart";

export const metadata: Metadata = { title: "Owner dashboard", robots: { index: false, follow: false } };

type Params = { range?: string; from?: string; to?: string };
const box = "rounded-2xl border border-latte bg-paper p-5";
const h2 = "font-display text-2xl font-semibold";
const select = "rounded-lg border border-latte bg-paper px-2 py-1.5 text-sm";
const th = "px-3 py-2 text-left font-semibold";
const td = "px-3 py-3 align-top";

const Stat = ({ label, value, note }: { label: string; value: string; note?: string }) => (
  <div className={box}>
    <dt className="text-sm text-roast">{label}</dt>
    <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</dd>
    {note && <p className="mt-1 text-xs text-roast">{note}</p>}
  </div>
);
const Section = ({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) => (
  <section className="mt-14">
    <h2 className={h2}>{title}</h2>
    {hint && <p className="mt-1 max-w-3xl text-sm text-roast">{hint}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <div className="mt-3 space-y-3 text-roast">{children}</div>
    </div>
  );
}

async function Dashboard({ searchParams }: { searchParams: Promise<Params> }) {
  await connection();
  const clerk = clerkConfigured();
  const supabase = supabaseReady();
  if (!clerk || !supabase) {
    return (
      <Notice title="Finish the setup">
        {!clerk && <p>Clerk is not connected yet. Add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code>CLERK_SECRET_KEY</code> to <code>.env.local</code>.</p>}
        {!supabase && <p>Supabase is not connected yet. Add <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env.local</code> and run <code>supabase/schema.sql</code>.</p>}
        <p>Then restart the server. The README has the full steps.</p>
      </Notice>
    );
  }
  if ((await getRole()) !== "owner") {
    return (
      <Notice title="Owner access only">
        <p>This area shows the cafe’s sales, profit and expenses, and only the owner account can open it. If you are the owner, ask whoever manages Clerk to set your role to owner.</p>
        <Link href="/admin" className="btn btn-gold">Go to the staff area</Link>
        <UserButton />
      </Notice>
    );
  }

  const sp = await searchParams;
  const range = resolveRange(sp.range, sp.from, sp.to);
  const today = resolveRange("today");
  const loaded = await Promise.all([fetchOrders(today), range.key === "today" ? null : fetchOrders(range), fetchExpenses(range), fetchCosts(), getProducts()]).catch((e: Error) => e);
  if (loaded instanceof Error) {
    return (
      <Notice title="Could not read the database">
        <p>{loaded.message}</p>
        <p>Check the Supabase keys, and that <code>supabase/schema.sql</code> has been run.</p>
      </Notice>
    );
  }
  const [todayOrders, rangeOrders, expenses, costs, products] = loaded;
  const orders = rangeOrders ?? todayOrders;
  const t = summarize(todayOrders);
  const s = summarize(orders);
  const profit = profitReport(s.collected, expenses);
  const best = bestSellers(orders, costs).slice(0, 15);
  const pay = paymentReport(orders);
  const series = dailySeries(orders, dayList(range));
  const costsSet = products.filter((p) => costs[p.id] !== undefined).length;
  const q = (p: Record<string, string>) => `?${new URLSearchParams(p)}`;
  const exportHref = (r: string, extra: Record<string, string> = {}) => `/api/owner/export${q({ range: r, format: "xlsx", ...extra })}`;
  const rangeLabel = range.from === range.to ? range.from : `${range.from} to ${range.to}`;
  const money = (v: number | null, why: string) => (v === null ? <span className="text-sm font-normal text-roast">{why}</span> : inr(v));
  const entered = (c: ExpenseCategory) => (profit[c].entered ? inr(profit[c].total) : "Not entered");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold">Owner dashboard</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="btn btn-ghost">Reviews</Link>
          <Link href="/admin/orders" className="btn btn-ghost">Orders</Link>
          <Link href="/admin/sales/access" className="btn btn-ghost">Manage admin access</Link>
          <UserButton />
        </div>
      </div>
      <p className="mt-2 max-w-3xl text-sm text-roast">All figures come from saved orders. Cancelled orders are never counted. Money counts as <strong>collected</strong> only after you mark the payment as Verified, because an order sent on WhatsApp is not proof of payment.</p>

      <Section title="Today’s sales" hint={`Today is ${toYmd(new Date())} (${timezone}).`}>
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Total sales (orders placed)" value={inr(t.booked)} note="Cancelled orders excluded" />
          <Stat label="Collected (verified payments)" value={inr(t.collected)} />
          <Stat label="Total orders" value={String(t.orders)} />
          <Stat label="Average order value" value={inr(t.avgOrder)} />
          <Stat label="Completed orders" value={String(t.completed)} />
          <Stat label="Pending orders" value={String(t.pending)} />
          <Stat label="Cancelled orders" value={String(t.cancelled)} />
          <Stat label="Total discounts" value={inr(t.discounts)} />
          <Stat label="Delivery charges collected" value={inr(t.deliveryCollected)} note="Verified payments only" />
        </dl>
      </Section>

      <Section title="Sales report">
        <nav aria-label="Report period" className="flex flex-wrap gap-2">
          {rangeOptions.filter(([k]) => k !== "custom").map(([k, label]) => (
            <Link key={k} href={`/admin/sales${q({ range: k })}`} aria-current={range.key === k ? "page" : undefined} className={`rounded-full border px-4 py-2 text-sm font-medium ${range.key === k ? "border-espresso bg-espresso text-cream" : "border-latte bg-paper hover:border-gold"}`}>
              {label}
            </Link>
          ))}
        </nav>
        <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="range" value="custom" />
          <label className="text-sm">From<input type="date" name="from" required defaultValue={range.from} className={`${select} ml-2`} /></label>
          <label className="text-sm">To<input type="date" name="to" required defaultValue={range.to} className={`${select} ml-2`} /></label>
          <button type="submit" className={`btn min-h-9 px-4 py-1.5 ${range.key === "custom" ? "btn-gold" : "btn-ghost"}`}>Custom range</button>
        </form>
        <p className="mt-5 text-sm text-roast">Showing {rangeLabel}</p>
        <dl className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Total sales (orders placed)" value={inr(s.booked)} />
          <Stat label="Collected (verified)" value={inr(s.collected)} />
          <Stat label="Waiting for payment check" value={inr(s.notVerified)} />
          <Stat label="Orders" value={`${s.orders - s.cancelled} (${s.cancelled} cancelled)`} />
        </dl>
        <div className={`${box} mt-4`}>
          <SalesChart data={series} />
          <p className="mt-2 text-xs text-roast">Wide light bar: orders placed that day. Gold bar: payments verified.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={exportHref("today")} className="btn btn-ghost min-h-9 px-4 py-1.5"><Download className="size-4" aria-hidden />Daily report</a>
          <a href={exportHref("last7")} className="btn btn-ghost min-h-9 px-4 py-1.5"><Download className="size-4" aria-hidden />Weekly report</a>
          <a href={exportHref("month")} className="btn btn-ghost min-h-9 px-4 py-1.5"><Download className="size-4" aria-hidden />Monthly report</a>
          <a href={exportHref(range.key, { from: range.from, to: range.to })} className="btn btn-gold min-h-9 px-4 py-1.5"><Download className="size-4" aria-hidden />Download this range</a>
        </div>
        <p className="mt-2 text-xs text-roast">
          Excel files (.xlsx) have Summary, Sales and Expenses sheets. Prefer CSV?{" "}
          <a href={exportHref("today", { format: "csv" })} className="underline underline-offset-4">Daily</a>,{" "}
          <a href={exportHref("last7", { format: "csv" })} className="underline underline-offset-4">weekly</a>,{" "}
          <a href={exportHref("month", { format: "csv" })} className="underline underline-offset-4">monthly</a>,{" "}
          <a href={exportHref(range.key, { from: range.from, to: range.to, format: "csv" })} className="underline underline-offset-4">this range</a>.
        </p>
      </Section>

      <Section title="Profit and expenses" hint={`For ${rangeLabel}. Profit uses verified payments only and appears only after you have entered the costs it needs. Total sales are never shown as profit.`}>
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Gross revenue (verified)" value={inr(s.collected)} />
          <Stat label={expenseLabels.purchase} value={entered("purchase")} />
          <Stat label={expenseLabels.ingredients} value={entered("ingredients")} />
          <Stat label={expenseLabels.operating} value={entered("operating")} />
          <Stat label={expenseLabels.delivery} value={entered("delivery")} />
          <div className={`${box} col-span-2`}>
            <dt className="text-sm text-roast">Estimated gross profit</dt>
            <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{money(profit.gross, "Enter product purchase or ingredient costs for this period to see it.")}</dd>
          </div>
          <div className={`${box} col-span-2`}>
            <dt className="text-sm text-roast">Estimated net profit</dt>
            <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{money(profit.net, profit.gross === null ? "Needs gross profit first." : "Enter operating or delivery expenses for this period to see it.")}</dd>
          </div>
        </dl>

        <form action={addExpense} className={`${box} mt-6 flex flex-wrap items-end gap-3`}>
          <label className="text-sm">Date<input type="date" name="date" required defaultValue={toYmd(new Date())} className={`${select} mt-1 block`} /></label>
          <label className="text-sm">Type
            <select name="category" className={`${select} mt-1 block`}>
              {(Object.keys(expenseLabels) as ExpenseCategory[]).map((c) => <option key={c} value={c}>{expenseLabels[c]}</option>)}
            </select>
          </label>
          <label className="min-w-40 flex-1 text-sm">Note (optional)<input name="description" maxLength={200} className={`${select} mt-1 block w-full`} /></label>
          <label className="text-sm">Amount (₹)<input type="number" name="amount" required min="0.01" step="0.01" className={`${select} mt-1 block w-32`} /></label>
          <button type="submit" className="btn btn-gold min-h-9 px-4 py-1.5">Add expense</button>
        </form>

        {expenses.length > 0 && (
          <ul className="mt-4 divide-y divide-latte rounded-2xl border border-latte bg-paper">
            {expenses.slice(0, 20).map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>{e.expense_date} · {expenseLabels[e.category]}{e.description ? ` · ${e.description}` : ""}</span>
                <span className="flex items-center gap-4">
                  <span className="font-semibold tabular-nums">{inr(Number(e.amount))}</span>
                  <form action={deleteExpense.bind(null, e.id)}><button type="submit" className="text-red-700 underline underline-offset-4">Delete</button></form>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Best selling products" hint={`Ranked by units sold in ${rangeLabel}, cancelled orders excluded. Margin shows once a cost price is set for the product.`}>
        {best.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gold p-8 text-center text-roast">No orders in this period yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-latte bg-paper">
            <table className="w-full text-sm">
              <thead className="border-b border-latte"><tr><th className={th}>Rank</th><th className={th}>Product</th><th className={th}>Category</th><th className={`${th} text-right`}>Units sold</th><th className={`${th} text-right`}>Revenue</th><th className={`${th} text-right`}>Margin</th></tr></thead>
              <tbody>
                {best.map((b) => (
                  <tr key={b.rank} className="border-b border-latte last:border-0">
                    <td className={`${td} tabular-nums`}>{b.rank}</td><td className={td}>{b.name}</td><td className={td}>{b.category}</td>
                    <td className={`${td} text-right tabular-nums`}>{b.units}</td><td className={`${td} text-right tabular-nums`}>{inr(b.revenue)}</td>
                    <td className={`${td} text-right tabular-nums`}>{b.margin === null ? "Cost not set" : inr(b.margin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <details className={`${box} mt-4`}>
          <summary className="cursor-pointer font-medium">Product cost prices ({costsSet} of {products.length} set)</summary>
          <form action={saveCosts} className="mt-4">
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <label key={p.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>{p.name}</span>
                  <input type="number" name={`cost:${p.id}`} min="0" step="0.01" defaultValue={costs[p.id]} aria-label={`Cost price of ${p.name} in rupees`} className={`${select} w-24`} />
                </label>
              ))}
            </div>
            <button type="submit" className="btn btn-gold mt-5 min-h-9 px-4 py-1.5">Save cost prices</button>
          </form>
        </details>
      </Section>

      <Section title="Payment report" hint="Only payments marked Verified count as received. Orders placed on WhatsApp stay in “waiting” until you check the money. Failed and refunded payments are left out.">
        <div className="overflow-x-auto rounded-2xl border border-latte bg-paper">
          <table className="w-full text-sm">
            <thead className="border-b border-latte"><tr><th className={th}>Method</th><th className={`${th} text-right`}>Orders</th><th className={`${th} text-right`}>Received (verified)</th><th className={`${th} text-right`}>Waiting for verification</th></tr></thead>
            <tbody>
              {pay.map((p) => (
                <tr key={p.method} className="border-b border-latte last:border-0">
                  <td className={td}>{paymentLabels[p.method]}</td><td className={`${td} text-right tabular-nums`}>{p.orders}</td>
                  <td className={`${td} text-right tabular-nums`}>{inr(p.received)} ({p.receivedCount})</td>
                  <td className={`${td} text-right tabular-nums`}>{inr(p.awaiting)} ({p.awaitingCount})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Sales history" hint={`Every order in ${rangeLabel}, newest first. Change the payment or order status in a row, then press Save. Newest 200 shown; the report download has all of them.`}>
        {orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gold p-8 text-center text-roast">No orders in this period yet. Orders appear here as customers place them on the website.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-latte bg-paper">
            <table className="w-full min-w-[60rem] text-sm">
              <thead className="border-b border-latte"><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Date and time</th><th className={th}>Products</th><th className={`${th} text-right`}>Amount</th><th className={th}>Payment method</th><th className={th}>Payment status</th><th className={th}>Order status</th><th className={th}><span className="sr-only">Save</span></th></tr></thead>
              <tbody>
                {orders.slice(0, 200).map((o) => {
                  const f = `order-${o.id}`;
                  return (
                    <tr key={o.id} className="border-b border-latte last:border-0">
                      <td className={`${td} whitespace-nowrap font-medium`}>
                        {orderNo(o.order_number)}
                        <form id={f} action={updateOrder}><input type="hidden" name="id" value={o.id} /></form>
                      </td>
                      <td className={td}>{o.customer_name}<br /><span className="text-roast">{o.customer_phone}</span></td>
                      <td className={`${td} whitespace-nowrap`}>{fmtDateTime(o.created_at)}</td>
                      <td className={`${td} min-w-48`}>{itemsText(o)}</td>
                      <td className={`${td} whitespace-nowrap text-right tabular-nums`}>{inr(o.total)}</td>
                      <td className={td}><select form={f} name="payment_method" defaultValue={o.payment_method} aria-label={`Payment method for ${orderNo(o.order_number)}`} className={select}>{paymentMethods.map((m) => <option key={m} value={m}>{paymentLabels[m]}</option>)}</select></td>
                      <td className={td}><select form={f} name="payment_status" defaultValue={o.payment_status} aria-label={`Payment status for ${orderNo(o.order_number)}`} className={select}>{Object.entries(paymentStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
                      <td className={td}><select form={f} name="status" defaultValue={o.status} aria-label={`Order status for ${orderNo(o.order_number)}`} className={select}>{Object.entries(orderStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
                      <td className={td}><button form={f} type="submit" className="btn btn-gold min-h-9 px-4 py-1.5">Save</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

export default function OwnerDashboardPage({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <Suspense fallback={<p className="px-4 py-24 text-center text-roast">Loading dashboard…</p>}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}
