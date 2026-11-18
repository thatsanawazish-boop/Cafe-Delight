"use server";

import { revalidatePath } from "next/cache";
import { clientKey } from "@/lib/client-key";
import { normalizePhone } from "@/lib/order";
import { addReview, hashIp, type ReviewState } from "@/lib/reviews";

export async function submitReview(_prev: ReviewState, fd: FormData): Promise<ReviewState> {
  // Hidden "website" field: people never see it, bots fill it in. Pretend it worked.
  if (String(fd.get("website") ?? "")) return { ok: true };

  const name = String(fd.get("name") ?? "").trim();
  const text = String(fd.get("text") ?? "").trim();
  const phoneRaw = String(fd.get("phone") ?? "").trim();
  const stars = Number(fd.get("stars"));
  const values = { name, text, phone: phoneRaw, stars: Number.isInteger(stars) ? stars : 0 };
  const phone = phoneRaw ? normalizePhone(phoneRaw) : "";

  const fields: NonNullable<ReviewState["fields"]> = {};
  if (name.length < 2 || name.length > 40) fields.name = "Enter your name (2 to 40 characters).";
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) fields.stars = "Choose a star rating.";
  if (text.length < 10 || text.length > 600) fields.text = "Write 10 to 600 characters about your visit.";
  if (phone && !/^[6-9]\d{9}$/.test(phone)) fields.phone = "Enter a valid 10-digit mobile number, or leave it empty.";
  if (Object.keys(fields).length) return { fields, values };

  const result = await addReview({ name, stars, text, phone: phone || undefined, ipHash: hashIp(await clientKey()) });
  if (result === "limit") return { error: "You have already sent several reviews today. Please try again tomorrow.", values };
  if (result === "duplicate") return { error: "We already have a review with this text.", values };
  revalidatePath("/admin");
  return { ok: true };
}
