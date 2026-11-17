import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Leader from "@/components/Leader";
import { cafe } from "@/lib/config";
import { whatsappReady } from "@/lib/order";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  const ready = whatsappReady();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Contact us</h1>
      <p className="mt-3 max-w-xl text-roast">Questions about the menu, a big order or a table? Send us a message.</p>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
              {cafe.phone}
            </p>
            <p className="flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
              {cafe.email}
            </p>
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
              {cafe.address}
            </p>
            {ready ? (
              <a href={`https://wa.me/${cafe.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                <MessageCircle className="size-5" aria-hidden />
                Chat on WhatsApp
              </a>
            ) : (
              <button type="button" disabled className="btn btn-gold">
                <MessageCircle className="size-5" aria-hidden />
                WhatsApp number not set yet
              </button>
            )}
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold">Opening hours</h2>
            <div className="mt-4 space-y-3">
              {cafe.hours.map(([days, time]) => (
                <Leader key={days} label={days} value={time} />
              ))}
            </div>
          </div>

          {cafe.mapEmbedUrl ? (
            <iframe src={cafe.mapEmbedUrl} title={`Map showing ${cafe.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-64 w-full rounded-2xl border-0" />
          ) : (
            <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-gold p-6 text-center text-roast">
              Google Maps placeholder. Paste the map embed link into <code>mapEmbedUrl</code> in <code>lib/config.ts</code> to show it here.
            </div>
          )}
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
