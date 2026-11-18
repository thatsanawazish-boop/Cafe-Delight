// Owner / admin roles come from Clerk *public metadata* ({ "role": "owner" } or { "role": "admin" }).
// Public metadata can be read by the browser but only changed from the Clerk dashboard or the backend,
// so a user cannot give themselves a role. Checked on the server for every page, action and API.
import { auth, currentUser } from "@clerk/nextjs/server";

export type Role = "owner" | "admin";

export const clerkConfigured = () => Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export async function getRole(): Promise<Role | null> {
  if (!clerkConfigured()) return null;
  const { userId } = await auth();
  if (!userId) return null;
  const role = (await currentUser())?.publicMetadata?.role;
  return role === "owner" || role === "admin" ? role : null;
}

/** Only "owner". An "admin" never passes, so regular admins never get owner permissions. */
export const isOwner = async () => (await getRole()) === "owner";

export async function ownerUserId(): Promise<string | null> {
  return (await isOwner()) ? (await auth()).userId : null;
}
