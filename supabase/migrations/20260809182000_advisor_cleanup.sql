-- Supabase advisor follow-ups after the cart-scoping fix.

-- 1. cart_session() had a mutable search_path (lint 0011).
create or replace function public.cart_session()
returns text
language sql
stable
set search_path = public
as $$
  select nullif(
    ((current_setting('request.headers', true))::json ->> 'x-cart-session'),
    ''
  );
$$;
revoke execute on function public.cart_session() from public;
grant execute on function public.cart_session() to anon, authenticated;

-- 2. handle_new_user() is a signup trigger; it must never be callable over
--    /rest/v1/rpc. The earlier revoke missed the implicit PUBLIC grant (lint 0028).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 3. Covering index for the last unindexed foreign key (lint 0001).
create index if not exists cart_items_product_id_idx on public.cart_items (product_id);
