# Cafe Delight

A cafe website built with Next.js (App Router), TypeScript and Tailwind CSS: menu with search and filters, cart saved in the browser, and a checkout that sends the order to the cafe on WhatsApp.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start   # production build
```

## Set up the cafe (`lib/config.ts`)

- `whatsappNumber`: country code + number, digits only, for example `919876543210`. Until you set it, the "Order on WhatsApp" button stays disabled.
- `phone`, `email`, `address`, `hours`, `social`, `deliveryFee`, `mapEmbedUrl`, `heroImage`: replace the placeholders.
- `reviews`: sample reviews. Replace them with real ones before launch.

## Menu and photos (`lib/products.ts`)

Edit names, prices, descriptions, `veg`, `bestseller`, `offer` (percent off) and `available`. Check every veg/non-veg label and price before going live. To add a photo, put the file in `public/images` and set `image: "/images/file.jpg"` on the dish. The same works for the gallery tiles and `heroImage`. Until then the site shows emoji placeholders.

## How orders work

The customer fills in the checkout form and a WhatsApp message is prepared with the items, quantities, prices, total, pickup or delivery, and address. WhatsApp opens with that message. **An order is not confirmed until the cafe replies.** There is no online payment.

## Not built yet

- Admin dashboard (login, add/edit/delete dishes, orders). It needs a backend: a password kept in an environment variable, a signed session cookie, and a database or file store. Browser local storage is not secure and cannot be shared between devices, so it is not used for this.
- Contact form email: the form opens WhatsApp until an email service is connected.
