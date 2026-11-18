// Admin login without extra packages: a password from .env.local and a signed, httpOnly cookie.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";

const COOKIE = "cafe-admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

const sign = (v: string) => createHmac("sha256", process.env.ADMIN_SECRET ?? "").update(v).digest("hex");
const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD) && (process.env.ADMIN_SECRET ?? "").length >= 16;
export const passwordMatches = (input: string) => same(sign(input), sign(process.env.ADMIN_PASSWORD ?? ""));

export async function createSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const [exp, sig] = ((await cookies()).get(COOKIE)?.value ?? "").split(".");
  return Boolean(exp && sig && Number(exp) > Date.now() && same(sig, sign(exp)));
}

export async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

// 5 wrong passwords lock that visitor out for 15 minutes.
const fails = new Map<string, { n: number; until: number }>();
export const lockedOut = (key: string) => (fails.get(key)?.until ?? 0) > Date.now();
export function noteLogin(key: string, ok: boolean) {
  if (ok) {
    fails.delete(key);
    return;
  }
  const n = (fails.get(key)?.n ?? 0) + 1;
  fails.set(key, n >= 5 ? { n: 0, until: Date.now() + 15 * 60_000 } : { n, until: 0 });
}
