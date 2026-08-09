-- Guest carts were world-readable: any visitor could select every row of
-- cart_items, including the user_id of signed-in shoppers. PostgREST cannot
-- constrain a client-supplied filter, so the policy matches the row's
-- session_id against the `x-cart-session` request header the storefront sends
-- on every Supabase call (see src/lib/supabase.ts).

create or replace function public.cart_session()
returns text
language sql
stable
as $$
  select nullif(
    ((current_setting('request.headers', true))::json ->> 'x-cart-session'),
    ''
  );
$$;

revoke execute on function public.cart_session() from public;
grant execute on function public.cart_session() to anon, authenticated;

drop policy if exists cart_items_select on public.cart_items;
drop policy if exists cart_items_insert on public.cart_items;
drop policy if exists cart_items_update on public.cart_items;
drop policy if exists cart_items_delete on public.cart_items;
drop policy if exists cart_items_all on public.cart_items;
drop policy if exists cart_items_public on public.cart_items;

create policy cart_items_select on public.cart_items
  for select to anon, authenticated
  using (
    (user_id is not null and user_id = auth.uid())
    or (session_id is not null and session_id = public.cart_session())
  );

create policy cart_items_insert on public.cart_items
  for insert to anon, authenticated
  with check (
    (user_id is null or user_id = auth.uid())
    and (session_id is null or session_id = public.cart_session())
  );

create policy cart_items_update on public.cart_items
  for update to anon, authenticated
  using (
    (user_id is not null and user_id = auth.uid())
    or (session_id is not null and session_id = public.cart_session())
  )
  with check (
    (user_id is null or user_id = auth.uid())
    and (session_id is null or session_id = public.cart_session())
  );

create policy cart_items_delete on public.cart_items
  for delete to anon, authenticated
  using (
    (user_id is not null and user_id = auth.uid())
    or (session_id is not null and session_id = public.cart_session())
  );

-- Advisor follow-ups: the signup trigger should not be callable by clients, and
-- the foreign keys the admin panel joins on were missing covering indexes.
revoke execute on function public.handle_new_user() from anon, authenticated;

create index if not exists crm_emails_customer_id_idx on public.crm_emails (customer_id);
create index if not exists crm_emails_admin_id_idx on public.crm_emails (admin_id);
create index if not exists crm_notes_customer_id_idx on public.crm_notes (customer_id);
create index if not exists crm_notes_admin_id_idx on public.crm_notes (admin_id);
create index if not exists cart_items_user_id_idx on public.cart_items (user_id);
create index if not exists favorites_product_id_idx on public.favorites (product_id);
create index if not exists orders_user_id_idx on public.orders (user_id);
