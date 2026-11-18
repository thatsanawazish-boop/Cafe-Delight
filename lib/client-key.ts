import { headers } from "next/headers";

/** Best-effort visitor address, used only for rate limits. */
export async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}
