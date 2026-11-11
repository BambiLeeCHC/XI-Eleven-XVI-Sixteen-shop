-- Group reads for 2–8 True North participants.
-- The service-role API writes the row after it checks accepted connections.
-- Participants can read their own rows. Birth data stays off this table.

create table if not exists public.group_reads (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  body text not null check (char_length(body) between 1 and 12000),
  participant_ids uuid[] not null check (
    cardinality(participant_ids) between 2 and 8
  ),
  participant_names text[] not null,
  question text check (question is null or char_length(question) <= 500),
  connection text check (connection is null or char_length(connection) <= 80),
  connection_note text check (connection_note is null or char_length(connection_note) <= 120),
  created_at timestamptz not null default now()
);

create index if not exists group_reads_host_idx
  on public.group_reads (host_id, created_at desc);

alter table public.group_reads enable row level security;

drop policy if exists "group reads visible to participants" on public.group_reads;
create policy "group reads visible to participants"
  on public.group_reads
  for select
  to authenticated
  using (auth.uid() = host_id or auth.uid() = any (participant_ids));

revoke all on public.group_reads from anon, authenticated;
grant select on public.group_reads to authenticated;
