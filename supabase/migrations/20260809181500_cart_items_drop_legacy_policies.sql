-- The previous migration dropped the four policy names this repo creates, but the
-- table still carried a legacy permissive policy under a different name, and
-- permissive policies are OR'd -- so carts stayed world-readable. Drop every
-- policy on cart_items by name from the catalog, then recreate the scoped set.

alter table public.cart_items enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'cart_items'
  loop
    execute format('drop policy %I on public.cart_items', p.policyname);
  end loop;
end $$;

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
