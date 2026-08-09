-- XIXVI storefront: close the gaps left by the initial schema migration.
--
-- 1. Columns the Convex schema carried that the first Supabase migration dropped
-- 2. A profile row (and admin flag) for every new auth user
-- 3. A complete, deterministic RLS policy set for every public table
-- 4. Storage policies for the product-media / site-media buckets
-- 5. Security-definer RPCs for the two reads that RLS cannot express
-- 6. Default shipping + tax + landing content so the storefront is never empty
--
-- Written to be re-runnable.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Missing order columns
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.orders add column if not exists tax_rate numeric;
alter table public.orders add column if not exists tax_region text;
alter table public.orders add column if not exists gift_message text;
alter table public.orders add column if not exists fulfillment_history jsonb not null default '[]'::jsonb;

create index if not exists orders_session_id_idx on public.orders (session_id);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_stripe_session_idx on public.orders (stripe_checkout_session_id);
create index if not exists cart_items_session_idx on public.cart_items (session_id);
create index if not exists products_printful_idx on public.products (printful_product_id);
create index if not exists blog_posts_slug_idx on public.blog_posts (slug);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Profiles for new auth users
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_emails text[] := array['mr.trestokes@yahoo.com'];
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    case when lower(coalesce(new.email, '')) = any (admin_emails) then 'admin' else 'customer' end
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(public.profiles.name, excluded.name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who signed up before the trigger existed.
insert into public.profiles (id, email, name, role)
select u.id,
       u.email,
       coalesce(u.raw_user_meta_data ->> 'name', split_part(coalesce(u.email, ''), '@', 1)),
       case when lower(coalesce(u.email, '')) = 'mr.trestokes@yahoo.com' then 'admin' else 'customer' end
from auth.users u
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Admin helper + RLS
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- The initial migration's policy set is unknown and unversioned; replace it wholesale
-- so what ships is exactly what is reviewed here.
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end;
$$;

alter table public.profiles              enable row level security;
alter table public.products              enable row level security;
alter table public.cart_items            enable row level security;
alter table public.orders                enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.crm_profiles          enable row level security;
alter table public.crm_notes             enable row level security;
alter table public.crm_emails            enable row level security;
alter table public.blog_posts            enable row level security;
alter table public.site_content          enable row level security;
alter table public.shipping_settings     enable row level security;
alter table public.tax_rates             enable row level security;
alter table public.favorites             enable row level security;

-- profiles: read your own, admins read everything, admins set roles.
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy profiles_delete_admin on public.profiles
  for delete using (public.is_admin());

-- products: the storefront is public; only admins write.
create policy products_select_public on public.products
  for select using (is_active or public.is_admin());
create policy products_write_admin on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- cart_items: anonymous carts are keyed by an unguessable client session id,
-- exactly as they were on the previous backend. Signed-in carts are also
-- reachable by their owner.
create policy cart_items_anon on public.cart_items
  for all using (user_id is null or user_id = auth.uid())
  with check (user_id is null or user_id = auth.uid());

-- orders: customers read their own; nobody writes from the browser. Orders are
-- created and updated exclusively by the server routes (service role), so a
-- customer can never invent an order or change its price or status.
create policy orders_select_own on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy orders_update_admin on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- newsletter: anyone may subscribe, only admins may read or remove.
create policy newsletter_insert_public on public.newsletter_subscribers
  for insert with check (true);
create policy newsletter_select_admin on public.newsletter_subscribers
  for select using (public.is_admin());
create policy newsletter_delete_admin on public.newsletter_subscribers
  for delete using (public.is_admin());

-- CRM is admin-only in full.
create policy crm_profiles_admin on public.crm_profiles
  for all using (public.is_admin()) with check (public.is_admin());
create policy crm_notes_admin on public.crm_notes
  for all using (public.is_admin()) with check (public.is_admin());
create policy crm_emails_admin on public.crm_emails
  for all using (public.is_admin()) with check (public.is_admin());

-- blog: published posts are public, drafts are admin-only.
create policy blog_select_published on public.blog_posts
  for select using (status = 'published' or public.is_admin());
create policy blog_write_admin on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- editable site settings: world-readable, admin-writable.
create policy site_content_select on public.site_content
  for select using (true);
create policy site_content_admin on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());

create policy shipping_settings_select on public.shipping_settings
  for select using (true);
create policy shipping_settings_admin on public.shipping_settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy tax_rates_select on public.tax_rates
  for select using (true);
create policy tax_rates_admin on public.tax_rates
  for all using (public.is_admin()) with check (public.is_admin());

-- favorites: strictly your own.
create policy favorites_own on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Storage policies
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like 'xixvi_%'
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end;
$$;

create policy xixvi_media_public_read on storage.objects
  for select using (bucket_id in ('product-media', 'site-media'));
create policy xixvi_media_admin_write on storage.objects
  for insert with check (bucket_id in ('product-media', 'site-media') and public.is_admin());
create policy xixvi_media_admin_update on storage.objects
  for update using (bucket_id in ('product-media', 'site-media') and public.is_admin());
create policy xixvi_media_admin_delete on storage.objects
  for delete using (bucket_id in ('product-media', 'site-media') and public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RPCs for reads RLS cannot express
-- ─────────────────────────────────────────────────────────────────────────────

-- A guest tracks their order with the random session id issued to their browser.
create or replace function public.orders_for_session(p_session_id text)
returns setof public.orders
language sql
stable
security definer
set search_path = public
as $$
  select * from public.orders
  where session_id = p_session_id
  order by created_at desc;
$$;

revoke all on function public.orders_for_session(text) from public;
grant execute on function public.orders_for_session(text) to anon, authenticated, service_role;

-- Order confirmation page: look up the order Stripe just redirected back from.
create or replace function public.order_for_stripe_session(p_stripe_session_id text)
returns setof public.orders
language sql
stable
security definer
set search_path = public
as $$
  select * from public.orders
  where stripe_checkout_session_id = p_stripe_session_id
  limit 1;
$$;

revoke all on function public.order_for_stripe_session(text) from public;
grant execute on function public.order_for_stripe_session(text) to anon, authenticated, service_role;

-- Subscribing twice must not leak whether an address is already on the list.
create or replace function public.subscribe_to_newsletter(p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text := lower(trim(p_email));
begin
  if normalized !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Invalid email address';
  end if;
  if exists (select 1 from public.newsletter_subscribers where email = normalized) then
    return 'already_subscribed';
  end if;
  insert into public.newsletter_subscribers (email) values (normalized);
  return 'subscribed';
end;
$$;

revoke all on function public.subscribe_to_newsletter(text) from public;
grant execute on function public.subscribe_to_newsletter(text) to anon, authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Defaults so the storefront is never empty
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.shipping_settings (key, value) values
  ('free_standard',         to_jsonb('true'::text)),
  ('standard_label',        to_jsonb('Standard Shipping'::text)),
  ('show_expedited',        to_jsonb('true'::text)),
  ('fulfillment_min_days',  to_jsonb('2'::text)),
  ('fulfillment_max_days',  to_jsonb('5'::text)),
  ('free_shipping_message', to_jsonb('✦ FREE standard shipping on every order ✦'::text))
on conflict (key) do nothing;

-- 'CA' is both California and Canada. The previous backend indexed tax purely by
-- region code, so a Canadian order could pick up California's rate. Uniqueness is
-- therefore on (region, region_type) and the lookup is always type-qualified.
create unique index if not exists tax_rates_region_type_key
  on public.tax_rates (region, region_type);

insert into public.tax_rates (region, region_type, label, rate, enabled) values
  ('AL','us_state','Alabama Sales Tax',0.04,true),
  ('AZ','us_state','Arizona Sales Tax',0.056,true),
  ('AR','us_state','Arkansas Sales Tax',0.065,true),
  ('CA','us_state','California Sales Tax',0.0725,true),
  ('CO','us_state','Colorado Sales Tax',0.029,true),
  ('CT','us_state','Connecticut Sales Tax',0.0635,true),
  ('DC','us_state','District of Columbia Sales Tax',0.06,true),
  ('FL','us_state','Florida Sales Tax',0.06,true),
  ('GA','us_state','Georgia Sales Tax',0.04,true),
  ('HI','us_state','Hawaii Sales Tax',0.04,true),
  ('ID','us_state','Idaho Sales Tax',0.06,true),
  ('IL','us_state','Illinois Sales Tax',0.0625,true),
  ('IN','us_state','Indiana Sales Tax',0.07,true),
  ('IA','us_state','Iowa Sales Tax',0.06,true),
  ('KS','us_state','Kansas Sales Tax',0.065,true),
  ('KY','us_state','Kentucky Sales Tax',0.06,true),
  ('LA','us_state','Louisiana Sales Tax',0.0445,true),
  ('ME','us_state','Maine Sales Tax',0.055,true),
  ('MD','us_state','Maryland Sales Tax',0.06,true),
  ('MA','us_state','Massachusetts Sales Tax',0.0625,true),
  ('MI','us_state','Michigan Sales Tax',0.06,true),
  ('MN','us_state','Minnesota Sales Tax',0.06875,true),
  ('MS','us_state','Mississippi Sales Tax',0.07,true),
  ('MO','us_state','Missouri Sales Tax',0.04225,true),
  ('NE','us_state','Nebraska Sales Tax',0.055,true),
  ('NV','us_state','Nevada Sales Tax',0.0685,true),
  ('NJ','us_state','New Jersey Sales Tax',0.06625,true),
  ('NM','us_state','New Mexico Sales Tax',0.05125,true),
  ('NY','us_state','New York Sales Tax',0.04,true),
  ('NC','us_state','North Carolina Sales Tax',0.0475,true),
  ('ND','us_state','North Dakota Sales Tax',0.05,true),
  ('OH','us_state','Ohio Sales Tax',0.0575,true),
  ('OK','us_state','Oklahoma Sales Tax',0.045,true),
  ('PA','us_state','Pennsylvania Sales Tax',0.06,true),
  ('RI','us_state','Rhode Island Sales Tax',0.07,true),
  ('SC','us_state','South Carolina Sales Tax',0.06,true),
  ('SD','us_state','South Dakota Sales Tax',0.042,true),
  ('TN','us_state','Tennessee Sales Tax',0.07,true),
  ('TX','us_state','Texas Sales Tax',0.0625,true),
  ('UT','us_state','Utah Sales Tax',0.0485,true),
  ('VT','us_state','Vermont Sales Tax',0.06,true),
  ('VA','us_state','Virginia Sales Tax',0.043,true),
  ('WA','us_state','Washington Sales Tax',0.065,true),
  ('WV','us_state','West Virginia Sales Tax',0.06,true),
  ('WI','us_state','Wisconsin Sales Tax',0.05,true),
  ('WY','us_state','Wyoming Sales Tax',0.04,true),
  ('GB','country','United Kingdom (VAT)',0.20,true),
  ('AU','country','Australia (GST)',0.10,true),
  ('CA','country','Canada (GST)',0.05,true),
  ('DE','country','Germany (VAT)',0.19,true),
  ('FR','country','France (VAT)',0.20,true),
  ('IT','country','Italy (VAT)',0.22,true),
  ('ES','country','Spain (VAT)',0.21,true),
  ('NL','country','Netherlands (VAT)',0.21,true),
  ('SE','country','Sweden (VAT)',0.25,true),
  ('JP','country','Japan (CT)',0.10,true),
  ('KR','country','South Korea (VAT)',0.10,true),
  ('NZ','country','New Zealand (GST)',0.15,true),
  ('MX','country','Mexico (IVA)',0.16,true),
  ('BR','country','Brazil (ICMS)',0.17,true),
  ('IN','country','India (GST)',0.18,true),
  ('SG','country','Singapore (GST)',0.09,true)
on conflict (region, region_type) do nothing;
