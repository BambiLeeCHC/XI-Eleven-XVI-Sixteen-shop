-- Shared True North Circle. Anyone may read. Signed-in members insert
-- only as themselves. Realtime broadcasts inserts to open rooms.

create table if not exists public.circle_readings (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  sign text not null check (char_length(sign) between 1 and 20),
  focus text not null check (focus in ('general', 'career', 'love', 'money')),
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);

create index if not exists circle_readings_created_at_idx
  on public.circle_readings (created_at desc);

alter table public.circle_readings enable row level security;

drop policy if exists "circle readings are public" on public.circle_readings;
create policy "circle readings are public"
  on public.circle_readings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "members insert their own circle readings" on public.circle_readings;
create policy "members insert their own circle readings"
  on public.circle_readings
  for insert
  to authenticated
  with check (auth.uid() = author_id);

grant select on public.circle_readings to anon, authenticated;
grant insert on public.circle_readings to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'circle_readings'
     ) then
    alter publication supabase_realtime add table public.circle_readings;
  end if;
end $$;
