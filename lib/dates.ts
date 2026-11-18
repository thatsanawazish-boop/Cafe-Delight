// Report days follow the cafe's own timezone (cafe.timezone, Asia/Kolkata), not the server's.
import { cafe } from "./config";

export type RangeKey = "today" | "yesterday" | "last7" | "last30" | "month" | "lastmonth" | "custom";
export const rangeOptions: [RangeKey, string][] = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["last7", "Last 7 days"],
  ["last30", "Last 30 days"],
  ["month", "This month"],
  ["lastmonth", "Last month"],
  ["custom", "Custom range"],
];
/** from/to are inclusive local dates (YYYY-MM-DD); start/end are the exact instants, end is exclusive. */
export type Range = { key: RangeKey; from: string; to: string; start: Date; end: Date };

const tz = cafe.timezone;
const ymdFmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
export const toYmd = (d: Date | string) => ymdFmt.format(new Date(d));

export function addDays(ymd: string, n: number) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function tzOffsetMs(ts: number) {
  const p: Record<string, number> = {};
  for (const x of new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }).formatToParts(ts)) {
    if (x.type !== "literal") p[x.type] = Number(x.value);
  }
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ts;
}
const dayStart = (ymd: string) => {
  const utc = Date.parse(`${ymd}T00:00:00Z`);
  return new Date(utc - tzOffsetMs(utc));
};
const isYmd = (s?: string): s is string => Boolean(s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)));

export function resolveRange(key?: string, fromIn?: string, toIn?: string): Range {
  const today = toYmd(new Date());
  let k: RangeKey = rangeOptions.some(([x]) => x === key) ? (key as RangeKey) : "today";
  let from = today;
  let to = today;
  if (k === "yesterday") from = to = addDays(today, -1);
  else if (k === "last7") from = addDays(today, -6);
  else if (k === "last30") from = addDays(today, -29);
  else if (k === "month") from = `${today.slice(0, 8)}01`;
  else if (k === "lastmonth") {
    to = addDays(`${today.slice(0, 8)}01`, -1);
    from = `${to.slice(0, 8)}01`;
  } else if (k === "custom") {
    if (isYmd(fromIn) && isYmd(toIn)) {
      [from, to] = fromIn <= toIn ? [fromIn, toIn] : [toIn, fromIn];
      if (to > addDays(from, 365)) to = addDays(from, 365); // at most one year per report
    } else k = "today";
  }
  return { key: k, from, to, start: dayStart(from), end: dayStart(addDays(to, 1)) };
}

export function dayList(r: Range) {
  const out: string[] = [];
  for (let d = r.from; d <= r.to; d = addDays(d, 1)) out.push(d);
  return out;
}

export const fmtDateTime = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: tz, day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const fmtDay = (ymd: string) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-IN", { timeZone: "UTC", day: "numeric", month: "short" });
