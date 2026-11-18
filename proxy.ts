// Runs before every staff page and owner API. It only checks that someone is signed in;
// the role (owner or admin) is checked again on the server inside each page, action and route.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const isPublic = createRouteMatcher(["/admin/sign-in(.*)"]);
const guard = clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect();
});
const configured = Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function proxy(req: NextRequest, evt: NextFetchEvent) {
  return configured ? guard(req, evt) : NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*", "/api/owner/:path*"] };
