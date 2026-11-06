-- True North social layer. Writes from the app also persist locally
-- when this migration has not been applied yet. No billing tables change.

alter table public.profiles add column if not exists north_mood text;
alter table public.profiles add column if not exists north_anthem text;
alter table public.profiles add column if not exists north_altar text;
alter table public.profiles add column if not exists north_aura text;

create table if not exists public.north_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('pull', 'spread', 'chart', 'tandem', 'bulletin')),
  title text not null check (char_length(title) between 1 and 80),
  body text not null check (char_length(body) <= 2000),
  cards jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.north_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.north_posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);

create table if not exists public.north_reactions (
  post_id uuid not null references public.north_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('claim', 'felt', 'sync', 'save')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, kind)
);

create table if not exists public.north_top_eight (
  owner_id uuid not null references public.profiles (id) on delete cascade,
  slot smallint not null check (slot between 1 and 8),
  friend_id uuid references public.profiles (id) on delete set null,
  display_name text not null,
  handle text not null,
  sun text not null,
  moon text not null,
  rising text not null,
  vibe text not null,
  primary key (owner_id, slot)
);

alter table public.north_posts enable row level security;
alter table public.north_comments enable row level security;
alter table public.north_reactions enable row level security;
alter table public.north_top_eight enable row level security;

drop policy if exists "north posts are readable" on public.north_posts;
create policy "north posts are readable" on public.north_posts
  for select to anon, authenticated using (true);
drop policy if exists "authors insert posts" on public.north_posts;
create policy "authors insert posts" on public.north_posts
  for insert to authenticated with check (auth.uid() = author_id);

drop policy if exists "comments are readable" on public.north_comments;
create policy "comments are readable" on public.north_comments
  for select to anon, authenticated using (true);
drop policy if exists "authors insert comments" on public.north_comments;
create policy "authors insert comments" on public.north_comments
  for insert to authenticated with check (auth.uid() = author_id);

drop policy if exists "reactions are readable" on public.north_reactions;
create policy "reactions are readable" on public.north_reactions
  for select to authenticated using (true);
drop policy if exists "own reactions" on public.north_reactions;
create policy "own reactions" on public.north_reactions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "top eight is private" on public.north_top_eight;
create policy "top eight is private" on public.north_top_eight
  for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

grant select on public.north_posts, public.north_comments to anon, authenticated;
grant insert on public.north_posts, public.north_comments to authenticated;
grant select, insert, update, delete on public.north_reactions, public.north_top_eight to authenticated;
