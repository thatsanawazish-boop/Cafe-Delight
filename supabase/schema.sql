-- Cafe Delight: sales, payments, costs and expenses.
-- Run once in Supabase: SQL Editor > New query > paste this file > Run.
-- Row Level Security is ON for every table and there are NO public policies, so the browser can never read or
-- write these tables. Only the server (service role key) can, after it has checked the owner role.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity (start with 1001),
  customer_name text not null,
  customer_phone text not null,
  order_type text not null check (order_type in ('pickup', 'delivery')),
  address text,
  notes text,
  subtotal numeric(12,2) not null check (subtotal >= 0),      -- dishes, after offers
  discount numeric(12,2) not null default 0 check (discount >= 0), -- total offer discount on the dishes
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  total numeric(12,2) not null check (total >= 0),             -- subtotal + delivery_fee
  payment_method text not null default 'cash' check (payment_method in ('cash', 'upi', 'online')),
  -- Only 'verified' counts as money received. A WhatsApp order starts as 'unpaid'.
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'verified', 'failed', 'refunded')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null,
  product_name text not null,
  category text not null,
  qty integer not null check (qty > 0),
  list_price numeric(10,2) not null,   -- price before the offer
  unit_price numeric(10,2) not null,   -- price the customer pays per unit
  unit_cost numeric(10,2)              -- cost price when ordered (null if not entered yet)
);
create index if not exists order_items_order_idx on public.order_items (order_id);

create table if not exists public.product_costs (
  product_id text primary key,
  cost_price numeric(10,2) not null check (cost_price >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null,
  category text not null check (category in ('purchase', 'ingredients', 'operating', 'delivery')),
  description text,
  amount numeric(12,2) not null check (amount > 0),
  created_by text,                      -- Clerk user id of the owner who entered it
  created_at timestamptz not null default now()
);
create index if not exists expenses_date_idx on public.expenses (expense_date);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.product_costs enable row level security;
alter table public.expenses enable row level security;

-- Saves an order and its items in one step. Only the server can call it.
create or replace function public.create_order(p jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_num bigint; it jsonb;
begin
  insert into orders (customer_name, customer_phone, order_type, address, notes, subtotal, discount, delivery_fee, total, payment_method)
  values (p->>'customer_name', p->>'customer_phone', p->>'order_type', nullif(p->>'address', ''), nullif(p->>'notes', ''),
          (p->>'subtotal')::numeric, (p->>'discount')::numeric, (p->>'delivery_fee')::numeric, (p->>'total')::numeric, p->>'payment_method')
  returning id, order_number into v_id, v_num;
  for it in select * from jsonb_array_elements(p->'items') loop
    insert into order_items (order_id, product_id, product_name, category, qty, list_price, unit_price, unit_cost)
    values (v_id, it->>'product_id', it->>'product_name', it->>'category', (it->>'qty')::int,
            (it->>'list_price')::numeric, (it->>'unit_price')::numeric,
            (select cost_price from product_costs where product_id = it->>'product_id'));
  end loop;
  return v_num;
end $$;
revoke all on function public.create_order(jsonb) from public, anon, authenticated;
grant execute on function public.create_order(jsonb) to service_role;

-- Handy report for the Supabase table editor (the app itself calculates from orders directly).
-- Days are in Asia/Kolkata. Cancelled orders are excluded; "collected" counts verified payments only.
create or replace view public.daily_sales with (security_invoker = true) as
select (created_at at time zone 'Asia/Kolkata')::date as sale_date,
       count(*) filter (where status <> 'cancelled') as orders,
       coalesce(sum(total) filter (where status <> 'cancelled'), 0) as booked_sales,
       coalesce(sum(total) filter (where status <> 'cancelled' and payment_status = 'verified'), 0) as collected_revenue
from public.orders group by 1;
revoke all on public.daily_sales from anon, authenticated;
