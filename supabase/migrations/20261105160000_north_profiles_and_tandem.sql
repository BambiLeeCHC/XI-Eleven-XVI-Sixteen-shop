-- True North profiles and consented tandem readings.
--
-- Profile columns are optional orientation fields. Birth data already on
-- profiles stays private: tandem responses never select it for another user.
--
-- Connections and sessions are writable only through the service-role API,
-- which checks both parties. Authenticated clients may read rows they belong
-- to. This migration does not touch subscriptions, Stripe ids, or billing.

alter table public.profiles add column if not exists north_focus text;
alter table public.profiles add column if not exists north_note text;
alter table public.profiles add column if not exists north_onboarded_at timestamptz;

update public.profiles set north_focus = 'general' where north_focus is null;

alter table public.profiles alter column north_focus set default 'general';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'north_focus'
      and is_nullable = 'YES'
  ) then
    alter table public.profiles alter column north_focus set not null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_north_focus_check') then
    alter table public.profiles
      add constraint profiles_north_focus_check
      check (north_focus in ('general', 'career', 'love', 'money'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_north_note_len') then
    alter table public.profiles
      add constraint profiles_north_note_len
      check (north_note is null or char_length(north_note) <= 280);
  end if;
end $$;

create table if not exists public.north_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'revoked')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id)
);

create unique index if not exists north_connections_pair_idx
  on public.north_connections (
    least(requester_id, addressee_id),
    greatest(requester_id, addressee_id)
  );

create index if not exists north_connections_addressee_idx
  on public.north_connections (addressee_id, status);

create table if not exists public.tandem_sessions (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.north_connections (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  guest_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'invited'
    check (status in ('invited', 'active', 'declined', 'closed')),
  focus text not null default 'general'
    check (focus in ('general', 'career', 'love', 'money')),
  prompt text not null check (char_length(prompt) between 1 and 280),
  shared_reading text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  closed_at timestamptz,
  check (host_id <> guest_id)
);

create index if not exists tandem_sessions_connection_idx
  on public.tandem_sessions (connection_id, created_at desc);

create index if not exists tandem_sessions_guest_idx
  on public.tandem_sessions (guest_id, status);

create table if not exists public.tandem_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tandem_sessions (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  unique (session_id, author_id)
);

alter table public.north_connections enable row level security;
alter table public.tandem_sessions enable row level security;
alter table public.tandem_entries enable row level security;

drop policy if exists "north connections visible to parties" on public.north_connections;
create policy "north connections visible to parties"
  on public.north_connections
  for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "tandem sessions visible to parties" on public.tandem_sessions;
create policy "tandem sessions visible to parties"
  on public.tandem_sessions
  for select
  to authenticated
  using (auth.uid() = host_id or auth.uid() = guest_id);

drop policy if exists "tandem entries visible to parties" on public.tandem_entries;
create policy "tandem entries visible to parties"
  on public.tandem_entries
  for select
  to authenticated
  using (
    exists (
      select 1 from public.tandem_sessions s
      where s.id = tandem_entries.session_id
        and (s.host_id = auth.uid() or s.guest_id = auth.uid())
    )
  );

revoke all on public.north_connections from anon, authenticated;
revoke all on public.tandem_sessions from anon, authenticated;
revoke all on public.tandem_entries from anon, authenticated;
grant select on public.north_connections to authenticated;
grant select on public.tandem_sessions to authenticated;
grant select on public.tandem_entries to authenticated;
