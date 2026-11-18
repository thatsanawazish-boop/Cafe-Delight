import ExcelJS from "exceljs";
import { isOwner } from "@/lib/owner-auth";
import { fmtDateTime, resolveRange, toYmd } from "@/lib/dates";
import { paymentLabels } from "@/lib/order";
import { expenseLabels, fetchExpenses, fetchOrders, itemsText, orderNo, orderStatusLabels, paymentStatusLabels, profitReport, summarize, timezone, type ExpenseCategory } from "@/lib/sales";

// Owner-only report built from real orders: Excel (.xlsx, default) or CSV (?format=csv).
const csvCell = (v: string | number) => {
  if (typeof v === "number") return String(v);
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v; // stops customer-typed text from running as a spreadsheet formula
  return `"${safe.replace(/"/g, '""')}"`;
};
const money = '"₹"#,##0.00';
const head = ["Order number", "Date", "Time", "Customer", "Phone", "Order type", "Products", "Subtotal", "Discount", "Delivery fee", "Total", "Payment method", "Payment status", "Order status", "Counted in sales", "Counted as collected"];
const widths = [14, 12, 10, 22, 14, 11, 48, 12, 12, 12, 12, 16, 16, 14, 16, 20];

export async function GET(req: Request) {
  if (!(await isOwner())) return new Response("Owner access required.", { status: 403 });
  const u = new URL(req.url).searchParams;
  const range = resolveRange(u.get("range") ?? undefined, u.get("from") ?? undefined, u.get("to") ?? undefined);
  const orders = await fetchOrders(range);
  const s = summarize(orders);
  const time = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { timeZone: timezone, hour12: false });
  const rows = orders.map((o) => [
    orderNo(o.order_number), toYmd(o.created_at), time(o.created_at), o.customer_name, o.customer_phone, o.order_type, itemsText(o),
    Number(o.subtotal), Number(o.discount), Number(o.delivery_fee), Number(o.total), paymentLabels[o.payment_method], paymentStatusLabels[o.payment_status], orderStatusLabels[o.status],
    o.status === "cancelled" ? "No" : "Yes", o.status !== "cancelled" && o.payment_status === "verified" ? "Yes" : "No",
  ]);
  const name = `cafe-delight-sales_${range.from}_to_${range.to}`;

  if (u.get("format") === "csv") {
    const all: (string | number)[][] = [head, ...rows, [], ["Period", `${range.from} to ${range.to}`], ["Total sales (cancelled excluded)", s.booked], ["Collected (verified payments only)", s.collected], ["Orders", s.orders], ["Cancelled orders", s.cancelled], ["Generated", fmtDateTime(new Date().toISOString())]];
    return new Response("\uFEFF" + all.map((r) => r.map(csvCell).join(",")).join("\r\n"), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}.csv"`, "Cache-Control": "no-store" },
    });
  }

  const expenses = await fetchExpenses(range);
  const p = profitReport(s.collected, expenses);
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cafe Delight";
  const bold = (ws: ExcelJS.Worksheet) => {
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];
  };

  const sum = wb.addWorksheet("Summary");
  sum.getColumn(1).width = 46;
  sum.getColumn(2).width = 26;
  const lines: [string, string | number][] = [
    ["Period", `${range.from} to ${range.to}`], ["Timezone", timezone], ["", ""],
    ["Total sales (orders placed, cancelled excluded)", s.booked], ["Collected (verified payments only)", s.collected], ["Waiting for payment verification", s.notVerified],
    ["Orders", s.orders], ["Cancelled orders", s.cancelled], ["Total discounts", s.discounts], ["Delivery charges collected", s.deliveryCollected], ["", ""],
    ...(Object.keys(expenseLabels) as ExpenseCategory[]).map((c): [string, string | number] => [expenseLabels[c], p[c].entered ? p[c].total : "Not entered"]),
    ["Estimated gross profit", p.gross ?? "Not enough cost data entered"], ["Estimated net profit", p.net ?? "Not enough cost data entered"],
  ];
  for (const [label, value] of lines) {
    const r = sum.addRow([label, value]);
    r.getCell(1).font = { bold: true };
    if (typeof value === "number" && label !== "Orders" && label !== "Cancelled orders") r.getCell(2).numFmt = money;
  }

  const ws = wb.addWorksheet("Sales");
  ws.addRow(head);
  rows.forEach((r) => ws.addRow(r));
  bold(ws);
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));
  [8, 9, 10, 11].forEach((n) => (ws.getColumn(n).numFmt = money));

  const ex = wb.addWorksheet("Expenses");
  ex.addRow(["Date", "Type", "Note", "Amount"]);
  expenses.forEach((e) => ex.addRow([e.expense_date, expenseLabels[e.category], e.description ?? "", Number(e.amount)]));
  bold(ex);
  [12, 26, 40, 14].forEach((w, i) => (ex.getColumn(i + 1).width = w));
  ex.getColumn(4).numFmt = money;

  const buf = await wb.xlsx.writeBuffer();
  return new Response(new Uint8Array(buf as ArrayBuffer), {
    headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${name}.xlsx"`, "Cache-Control": "no-store" },
  });
}
