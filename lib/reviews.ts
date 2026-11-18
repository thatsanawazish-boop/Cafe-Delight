// Review storage. Reviews are kept in data/reviews.json (created on the first review).
// Every access goes through this file, so it can later be pointed at a real database.
import { createHmac, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type ReviewStatus = "pending" | "approved" | "rejected";
export type Review = {
  id: string;
  name: string;
  stars: number;
  text: string;
  phone?: string; // private: only the cafe sees it, to check the review is from a real customer
  status: ReviewStatus;
  createdAt: string;
  ipHash: string; // hashed, used only to limit spam
};
export type PublicReview = Pick<Review, "id" | "name" | "stars" | "text" | "createdAt">;
export type ReviewState = {
  ok?: boolean;
  error?: string;
  fields?: Partial<Record<"name" | "stars" | "text" | "phone", string>>;
  values?: { name: string; text: string; phone: string; stars: number };
};

const FILE = path.join(process.cwd(), "data", "reviews.json");
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Review[]> {
  try {
    const data: unknown = JSON.parse(await fs.readFile(FILE, "utf8"));
    return Array.isArray(data) ? (data as Review[]) : [];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

async function save(list: Review[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2));
  await fs.rename(tmp, FILE);
}

// Writes run one after another so two reviews arriving together cannot overwrite each other.
function mutate<T>(fn: (list: Review[]) => T): Promise<T> {
  const run = queue.then(async () => {
    const list = await load();
    const out = fn(list);
    await save(list);
    return out;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const hashIp = (ip: string) => createHmac("sha256", process.env.IP_HASH_SECRET || "cafe-delight").update(ip).digest("hex").slice(0, 24);
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

export function addReview(r: { name: string; stars: number; text: string; phone?: string; ipHash: string }) {
  return mutate((list) => {
    const dayAgo = Date.now() - 86_400_000;
    if (list.filter((x) => x.ipHash === r.ipHash && Date.parse(x.createdAt) > dayAgo).length >= 3) return "limit" as const;
    if (list.some((x) => norm(x.text) === norm(r.text))) return "duplicate" as const;
    list.push({ ...r, id: randomUUID(), status: "pending", createdAt: new Date().toISOString() });
    return "ok" as const;
  });
}

export const setStatus = (id: string, status: ReviewStatus) =>
  mutate((list) => {
    const r = list.find((x) => x.id === id);
    if (r) r.status = status;
  });

export const deleteReview = (id: string) =>
  mutate((list) => {
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) list.splice(i, 1);
  });

const newestFirst = (a: Review, b: Review) => b.createdAt.localeCompare(a.createdAt);

/** Only approved reviews, without any private fields. */
export async function getApproved(): Promise<PublicReview[]> {
  return (await load())
    .filter((r) => r.status === "approved")
    .sort(newestFirst)
    .map(({ id, name, stars, text, createdAt }) => ({ id, name, stars, text, createdAt }));
}

export async function getAllReviews(): Promise<Review[]> {
  return (await load()).sort(newestFirst);
}

export function summarize(list: { stars: number }[]) {
  return { count: list.length, average: list.length ? list.reduce((s, r) => s + r.stars, 0) / list.length : 0 };
}

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
