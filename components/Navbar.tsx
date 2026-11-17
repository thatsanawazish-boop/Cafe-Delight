"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Coffee, Menu, ShoppingBag, X } from "lucide-react";
import { cafe } from "@/lib/config";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-latte bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 font-display text-2xl font-semibold">
          <Coffee className="size-6 text-gold" aria-hidden />
          {cafe.name}
        </Link>
        <nav aria-label="Main" className="hidden gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-sm font-medium hover:text-gold ${pathname === l.href ? "text-gold" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/cart" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`} className="relative grid size-11 place-items-center rounded-full hover:bg-latte">
            <ShoppingBag className="size-6" aria-hidden />
            {count > 0 && <span className="absolute right-0 top-0 grid min-w-5 place-items-center rounded-full bg-gold px-1 text-xs font-bold text-white">{count}</span>}
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
            className="grid size-11 place-items-center rounded-full hover:bg-latte md:hidden"
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="flex flex-col border-t border-latte px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-lg font-medium">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
