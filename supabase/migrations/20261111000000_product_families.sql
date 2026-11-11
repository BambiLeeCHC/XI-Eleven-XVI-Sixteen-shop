-- Product families for the dial shop.
--
-- A family is one garment (D-Slip Dress, J-Glitch Jersey, …). Each colourway
-- stays its own products row. This migration does not run on deploy.
--
-- Apply it once, from the repo root, with the Supabase CLI pointed at the
-- store project:
--   supabase db push
-- Or open the Supabase SQL editor, paste this file, and run it.

create table if not exists public.product_families (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  gender text not null check (gender in ('women', 'men')),
  style_key text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists family_id uuid references public.product_families (id) on delete set null;

create index if not exists products_family_idx on public.products (family_id);

create table if not exists public.product_family_colorways (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.product_families (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  color_name text not null,
  hex text,
  unique (product_id)
);

create index if not exists product_family_colorways_family_idx
  on public.product_family_colorways (family_id);

alter table public.product_families enable row level security;
alter table public.product_family_colorways enable row level security;

drop policy if exists product_families_select_public on public.product_families;
create policy product_families_select_public on public.product_families
  for select using (true);
drop policy if exists product_families_write_admin on public.product_families;
create policy product_families_write_admin on public.product_families
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists product_family_colorways_select_public on public.product_family_colorways;
create policy product_family_colorways_select_public on public.product_family_colorways
  for select using (true);
drop policy if exists product_family_colorways_write_admin on public.product_family_colorways;
create policy product_family_colorways_write_admin on public.product_family_colorways
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.product_families (slug, name, gender, style_key, sort_order)
values
  ('b-lift', 'B-Lift Sports Bra', 'women', 'B-Lift', 10),
  ('l-flow', 'L-Flow Leggings', 'women', 'L-Flow', 20),
  ('d-slip', 'D-Slip Dress', 'women', 'D-Slip', 30),
  ('s-glitch-2-5', 'S-Glitch 2.5" Shorts', 'men', 'S-Glitch 2.5', 40),
  ('s-glitch-6-3', 'S-Glitch 6.3" Shorts', 'men', 'S-Glitch 6.3', 50),
  ('t-icon-oversized', 'T-Icon Oversized Tee', 'men', 'T-Icon Oversized', 60),
  ('t-icon-tie-dye', 'T-Icon Tie-Dye Tee', 'men', 'T-Icon Tie-Dye', 70),
  ('t-icon', 'T-Icon Tee', 'men', 'T-Icon', 80),
  ('j-glitch', 'J-Glitch Jersey', 'men', 'J-Glitch', 90)
on conflict (slug) do update
set
  name = excluded.name,
  gender = excluded.gender,
  style_key = excluded.style_key,
  sort_order = excluded.sort_order;

-- Longest style key wins, so "T-Icon Tie-Dye" is not filed under "T-Icon".
update public.products as product
set family_id = match.family_id
from (
  select distinct on (row.id) row.id as product_id, family.id as family_id
  from public.products as row
  join public.product_families as family
    on row.name like family.style_key || '%'
  order by row.id, length(family.style_key) desc
) as match
where product.id = match.product_id
  and product.family_id is null;

insert into public.product_family_colorways (family_id, product_id, color_name, hex)
select
  product.family_id,
  product.id,
  coalesce(substring(product.name from '\[([^\]]+)\]'), 'Default'),
  case
    when product.name ilike '%black / white%' or product.name ilike '%black/white%' then '#D5D5D5'
    when product.name ilike '%navy / white%' or product.name ilike '%navy/white%' then '#1B3A4B'
    when product.name ilike '%french navy%' then '#16324F'
    when product.name ilike '%dash white%' then '#F3F0E8'
    when product.name ilike '%dash black%' then '#161616'
    when product.name ilike '%heather%' then '#8D8D92'
    when product.name ilike '%stone%' then '#C6B7A2'
    when product.name ilike '%milky%' then '#243056'
    when product.name ilike '%sherbet%' then '#F3A48A'
    when product.name ilike '%rainbow%' then '#7A6AE8'
    when product.name ilike '%pink lace%' then '#E4A9C4'
    when product.name ilike '%volt%' then '#C6F25A'
    when product.name ilike '%ice%' then '#CDE4F5'
    when product.name ilike '%peach%' then '#F4C4B0'
    when product.name ilike '%whisper%' or product.name ilike '%white%' then '#EDE6D9'
    when product.name ilike '%pink%' then '#D9A8B8'
    when product.name ilike '%nude%' then '#E4C7B7'
    when product.name ilike '%red%' then '#C44848'
    when product.name ilike '%cerulean%' then '#4C8DAB'
    when product.name ilike '%black%' then '#161616'
    else null
  end
from public.products as product
where product.family_id is not null
on conflict (product_id) do update
set
  family_id = excluded.family_id,
  color_name = excluded.color_name,
  hex = excluded.hex;
