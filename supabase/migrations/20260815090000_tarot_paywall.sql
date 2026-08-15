-- Tarot paywall: intake fields on profiles, subscriptions, and pay-per-question.
--
-- 1. Sign-up intake that stays consistent visit to visit: birth date, gender
--    identity, sexual orientation — collected once at registration. `situation`
--    ("what's going on right now") is intentionally NOT collected at sign-up:
--    it changes every visit, so it's asked fresh right before each reading
--    instead, and only optionally saved here as the most recent one typed.
-- 2. `subscriptions` mirrors Stripe subscription state for the deep-reading
--    paywall (7-day trial, then $7/week). One row per user; upserted from the
--    Stripe webhook, never trusted from the client.
-- 3. `reading_questions` is the $2.99 pay-per-question add-on: one row per
--    paid follow-up question + its AI-generated answer.

alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists situation text;
alter table public.profiles add column if not exists gender_identity text;
alter table public.profiles add column if not exists sexual_orientation text;

-- Carry birth_date/gender_identity/sexual_orientation from sign-up metadata
-- into the profile row, same pattern as the existing name/role handling in
-- handle_new_user(). All optional/nullable. `situation` is deliberately not
-- populated here — it's per-reading, not per-registration (see above).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_emails text[] := array['mr.trestokes@yahoo.com'];
begin
  insert into public.profiles (
    id, email, name, role, birth_date, gender_identity, sexual_orientation
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    case when lower(coalesce(new.email, '')) = any (admin_emails) then 'admin' else 'customer' end,
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    nullif(new.raw_user_meta_data ->> 'gender_identity', ''),
    nullif(new.raw_user_meta_data ->> 'sexual_orientation', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(public.profiles.name, excluded.name),
        birth_date = coalesce(public.profiles.birth_date, excluded.birth_date),
        gender_identity = coalesce(public.profiles.gender_identity, excluded.gender_identity),
        sexual_orientation = coalesce(public.profiles.sexual_orientation, excluded.sexual_orientation);
  return new;
end;
$$;

create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'none',
  trial_end timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_stripe_subscription_idx
  on public.subscriptions (stripe_subscription_id);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- No insert/update/delete policies for authenticated/anon: only the
-- service-role webhook and admin API routes write this table.

create table if not exists public.deep_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  spread jsonb not null,
  reading text not null,
  created_at timestamptz not null default now()
);

create index if not exists deep_readings_user_idx
  on public.deep_readings (user_id, created_at desc);

alter table public.deep_readings enable row level security;

drop policy if exists "deep_readings_select_own" on public.deep_readings;
create policy "deep_readings_select_own" on public.deep_readings
  for select using (auth.uid() = user_id);

-- Inserts happen server-side (service role, after entitlement is checked),
-- so there is no client-facing insert policy here either.

create table if not exists public.reading_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  reading_context jsonb not null,
  question text not null,
  answer text,
  status text not null default 'pending',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create index if not exists reading_questions_user_idx
  on public.reading_questions (user_id, created_at desc);

alter table public.reading_questions enable row level security;

drop policy if exists "reading_questions_select_own" on public.reading_questions;
create policy "reading_questions_select_own" on public.reading_questions
  for select using (auth.uid() = user_id);

-- Inserts happen server-side (service role) after a checkout session is
-- created, so there is no client-facing insert policy here either.
