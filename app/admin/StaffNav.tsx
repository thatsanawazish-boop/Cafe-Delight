import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { Role } from "@/lib/owner-auth";

export default function StaffNav({ role }: { role: Role }) {
  const links: [string, string][] = [["/admin", "Reviews"], ["/admin/orders", "Orders"], ...(role === "owner" ? ([["/admin/sales", "Owner dashboard"]] as [string, string][]) : [])];
  return (
    <nav aria-label="Staff" className="flex flex-wrap items-center gap-2">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="btn btn-ghost min-h-9 px-4 py-1.5">
          {label}
        </Link>
      ))}
      <UserButton />
    </nav>
  );
}
