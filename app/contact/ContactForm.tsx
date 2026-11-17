"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { cafe } from "@/lib/config";
import { whatsappReady, whatsappUrl } from "@/lib/order";

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

function check(v: Values): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Enter a valid email address, like name@example.com.";
  if (v.message.trim().length < 10) e.message = "Write at least 10 characters so we know how to help.";
  return e;
}

export default function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const canSend = whatsappReady();

  function submit(e: FormEvent) {
    e.preventDefault();
    const found = check(values);
    setErrors(found);
    setSent(false);
    if (Object.keys(found).length > 0 || !canSend) return;
    const text = `Hello ${cafe.name}, I’m ${values.name.trim()} (${values.email.trim()}).\n\n${values.message.trim()}`;
    window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  const field = (key: keyof Values, label: string, input: React.ReactNode) => (
    <div>
      <label htmlFor={key} className="mb-1 block font-medium">
        {label}
      </label>
      {input}
      {errors[key] && (
        <p id={`${key}-error`} role="alert" className="mt-1 text-sm text-red-700">
          {errors[key]}
        </p>
      )}
    </div>
  );
  const props = (key: keyof Values) => ({
    id: key,
    value: values[key],
    onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value })),
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
    className: "field",
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-6 rounded-3xl border border-latte bg-paper p-6 sm:p-8">
      <h2 className="font-display text-2xl font-semibold">Send us a message</h2>
      {field("name", "Your name", <input autoComplete="name" {...props("name")} />)}
      {field("email", "Email address", <input type="email" autoComplete="email" {...props("email")} />)}
      {field("message", "Message", <textarea rows={5} {...props("message")} />)}
      <p className="text-sm text-roast">Your message opens in WhatsApp, ready to send. No email service is connected yet.</p>
      {!canSend && (
        <p role="note" className="rounded-xl border border-gold p-4 text-sm">
          Messaging is switched off until the cafe’s WhatsApp number is added in <code>lib/config.ts</code>.
        </p>
      )}
      <button type="submit" disabled={!canSend} className="btn btn-gold">
        <MessageCircle className="size-5" aria-hidden />
        Send on WhatsApp
      </button>
      {sent && (
        <p role="status" className="text-sm">
          WhatsApp should now be open with your message. It is only sent when you press send there.
        </p>
      )}
    </form>
  );
}
