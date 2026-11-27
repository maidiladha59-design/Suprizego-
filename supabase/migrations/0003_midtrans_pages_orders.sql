create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[A-Za-z0-9]{10,64}$'),
  data jsonb not null default '{}'::jsonb,
  paket text not null check (paket in ('dasar', 'plus', 'abadi')),
  status text not null default 'draft' check (status in ('draft', 'pending', 'active', 'expired')),
  active_until timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete restrict,
  order_id text not null unique check (char_length(order_id) between 10 and 100),
  paket text not null check (paket in ('dasar', 'plus', 'abadi')),
  gross_amount integer not null check (gross_amount > 0),
  status text not null default 'pending' check (
    status in ('pending', 'settlement', 'capture', 'deny', 'expire', 'cancel', 'failure')
  ),
  snap_token text,
  payment_type text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_page_id_idx on public.orders(page_id);
create index if not exists pages_active_idx on public.pages(status, active_until);

alter table public.pages enable row level security;
alter table public.orders enable row level security;

create or replace function public.activate_midtrans_order(
  p_order_id text,
  p_payment_type text,
  p_paid_at timestamptz,
  p_active_days integer
)
returns public.orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  order_row public.orders%rowtype;
  page_row public.pages%rowtype;
begin
  if p_active_days is not null and p_active_days < 1 then
    raise exception 'Durasi aktif tidak valid.';
  end if;

  select * into order_row
  from public.orders
  where order_id = p_order_id
  for update;

  if not found then
    raise exception 'Order tidak ditemukan.';
  end if;

  if order_row.status in ('settlement', 'capture') then
    return order_row;
  end if;

  if order_row.status <> 'pending' then
    raise exception 'Order tidak dapat diaktifkan dari status %.', order_row.status;
  end if;

  select * into page_row
  from public.pages
  where id = order_row.page_id
  for update;

  if not found then
    raise exception 'Halaman tidak ditemukan.';
  end if;

  update public.pages
  set
    status = 'active',
    active_until = case
      when p_active_days is null then null
      else p_paid_at + make_interval(days => p_active_days)
    end,
    paid_at = p_paid_at,
    updated_at = now()
  where id = page_row.id;

  update public.orders
  set
    status = 'settlement',
    payment_type = nullif(btrim(p_payment_type), ''),
    paid_at = p_paid_at,
    updated_at = now()
  where id = order_row.id
  returning * into order_row;

  return order_row;
end;
$$;

create or replace function public.fail_midtrans_order(
  p_order_id text,
  p_status text,
  p_payment_type text
)
returns public.orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  order_row public.orders%rowtype;
begin
  if p_status not in ('deny', 'expire', 'cancel', 'failure') then
    raise exception 'Status kegagalan tidak valid.';
  end if;

  select * into order_row
  from public.orders
  where order_id = p_order_id
  for update;

  if not found then
    raise exception 'Order tidak ditemukan.';
  end if;

  if order_row.status in ('settlement', 'capture') then
    return order_row;
  end if;

  update public.orders
  set
    status = p_status,
    payment_type = nullif(btrim(p_payment_type), ''),
    updated_at = now()
  where id = order_row.id
  returning * into order_row;

  update public.pages
  set status = 'draft', active_until = null, updated_at = now()
  where id = order_row.page_id and paid_at is null;

  return order_row;
end;
$$;

revoke all on function public.activate_midtrans_order(text, text, timestamptz, integer) from public;
revoke all on function public.fail_midtrans_order(text, text, text) from public;
grant execute on function public.activate_midtrans_order(text, text, timestamptz, integer) to service_role;
grant execute on function public.fail_midtrans_order(text, text, text) to service_role;
