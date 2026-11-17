import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 text-roast">The page you’re looking for doesn’t exist or has moved.</p>
      <Link href="/menu" className="btn btn-gold mt-8">
        Browse the menu
      </Link>
    </div>
  );
}
