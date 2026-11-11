-- Flags for orders that trip the reseller lookback.
-- The API writes these with the service role. Shoppers cannot read them.

create table if not exists public.order_flags (
  id uuid primary key default gen_random_uuid(),
  order_id text,
  session_id text,
  address_hash text,
  email text,
  user_id uuid,
  reason text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_flags_created_at_idx
  on public.order_flags (created_at desc);

create index if not exists order_flags_email_idx
  on public.order_flags (email);

alter table public.order_flags enable row level security;

drop policy if exists order_flags_admin_select on public.order_flags;
create policy order_flags_admin_select on public.order_flags
  for select to authenticated
  using (public.is_admin());
