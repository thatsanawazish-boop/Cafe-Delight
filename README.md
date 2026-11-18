# Cafe Delight

A cafe website built with Next.js (App Router), TypeScript and Tailwind CSS: menu with search and filters, cart saved in the browser, and a checkout that sends the order to the cafe on WhatsApp.

## Run it (Node 20.9 or newer)

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start   # production build
```

## Set up the cafe (`lib/config.ts`)

- `whatsappNumber`: country code + number, digits only, for example `919876543210`. Until you set it, the "Order on WhatsApp" button stays disabled.
- `phone`, `email`, `address`, `hours`, `social`, `deliveryFee`, `mapEmbedUrl`: replace the placeholders (the hours are samples).

## Menu (`lib/products.ts`)

The menu was typed in from photos of the cafe's menu card. The photos were small and blurry, so **check every price against the printed menu**, especially the lines marked `VERIFY` (all pizzas, sandwiches, Pizza Fries, quick bites, Veg Shawarma). Edit names, prices, descriptions, `available`, `offer` (percent off) and the `featured` list for the home page. Dishes with "Chicken" or "Omlet" in the name are marked non-veg.

## Photos (`public/images`)

The storefront and interior photos were taken from Google Maps photos uploaded by other people and may be subject to copyright. Replace them with the cafe's own photos before the website goes live (keep the same file names, or update `lib/config.ts` and `app/gallery/page.tsx`). To add a dish photo, put the file in `public/images` and set `image: "/images/file.jpg"` on the dish.

## How orders work

The customer fills in the checkout form and a WhatsApp message is prepared with the items, quantities, prices, total, pickup or delivery, and address. WhatsApp opens with that message. **An order is not confirmed until the cafe replies.** There is no online payment.

## Not built yet

- Admin editing of dishes and prices.
- Contact form email: the form opens WhatsApp until an email service is connected.

## Reviews and admin dashboard

- Customers write reviews at `/reviews`. Nothing is pre-filled: the site starts with no reviews and the cafe never adds any.
- Every new review is **pending** and stays hidden until you approve it at `/admin`. You can approve, reject or delete. The optional mobile number is private; use it to confirm the customer on WhatsApp.
- Spam protection: hidden bot field, 3 reviews per visitor per day, duplicate text blocked.
- **Staff login:** `/admin` and `/admin/orders` use the same Clerk login as the owner dashboard (roles `owner` or `admin`). Set it up with the steps in the owner dashboard section below.
- Reviews are saved in `data/reviews.json`. This works on your own computer or a VPS. On serverless hosts such as Vercel the disk is not permanent, so replace the functions in `lib/reviews.ts` with a database (Postgres, Supabase, MongoDB). Nothing else needs to change.
- Back up `data/reviews.json` regularly.

## Owner sales dashboard (`/admin/sales`)

Owner-only sales, payments, profit, expenses and CSV reports, built from real orders saved in Supabase. Nothing is sample data: it is empty until customers order.

**Setup (one time)**

1. `npm install @clerk/nextjs @supabase/supabase-js exceljs`
2. Supabase: create a project, open SQL Editor, run `supabase/schema.sql`. Put the Project URL and the **service_role** key in `.env.local` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). The service key is secret and server-only; never put it in a `NEXT_PUBLIC_` variable.
3. Clerk: create an application, copy the two keys into `.env.local`, set `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/sign-in`, and in the Clerk dashboard restrict or disable public sign-ups.
4. Make yourself the owner: Clerk dashboard > Users > your user > **Public metadata** > `{ "role": "owner" }`. Only the owner opens `/admin/sales`. Roles are checked on the server in every page, action and API route.
5. Restart the server and open `/admin/sales`.

**How the numbers work**

- Checkout saves every order (status Pending, payment Not verified) and then opens WhatsApp. Only orders placed after this update appear.
- Cancelled orders are never counted. *Collected* money and profit use only orders whose payment you marked **Verified** in the Sales history table.
- Gross profit = verified revenue minus product purchase and ingredient costs you entered. Net profit = gross profit minus operating and delivery expenses. Each is shown only once those costs exist for the selected period.
- Days follow `timezone` in `lib/config.ts` (Asia/Kolkata).
- Owner reports download as Excel (.xlsx, with Summary, Sales and Expenses sheets) or CSV: daily, weekly, monthly or any custom range.
- The owner makes other Clerk users **admins** at `/admin/sales/access`. Admins can moderate reviews (`/admin`) and update order status (`/admin/orders`). They cannot open sales, profit, expenses, payments, reports or exports, and cannot verify payments.
