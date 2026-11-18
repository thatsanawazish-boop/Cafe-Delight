import Link from "next/link";
import Leader from "./Leader";
import { cafe } from "@/lib/config";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
  { href: "/cart", label: "Your cart" },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-espresso text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr_1.3fr]">
        <div>
          <p className="font-display text-3xl font-semibold">{cafe.name}</p>
          <p className="mt-3 max-w-xs text-cream/70">{cafe.tagline}</p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {cafe.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-brass">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Footer">
          <p className="font-display text-xl">Explore</p>
          <ul className="mt-3 space-y-2 text-cream/80">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brass">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-display text-xl">Opening hours</p>
          <div className="mt-3 space-y-2 text-cream/80">
            {cafe.hours.map(([days, time]) => (
              <Leader key={days} label={days} value={time} />
            ))}
          </div>
          <p className="mt-6 text-cream/80">{cafe.address}</p>
          <p className="text-cream/80">{cafe.phone}</p>
          <p className="text-cream/80">{cafe.email}</p>
        </div>
      </div>
      <p className="border-t border-cream/10 px-4 py-5 text-center text-sm text-cream/60">© {cafe.name}. All rights reserved.</p>
    </footer>
  );
}
