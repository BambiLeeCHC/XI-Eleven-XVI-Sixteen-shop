-- Natal chart + numerology feature: birth time/location on profiles, plus a
-- geocode cache so we don't re-hit the geocoding service on every chart view.
--
-- birth_time / birth_location are optional (a chart can still render on date
-- alone, just less precisely) — collected once at registration alongside
-- birth_date, gender_identity, sexual_orientation (all "consistent facts",
-- per standing rule that only the per-reading "situation" is excluded from
-- sign-up).
--
-- birth_lat/birth_lng cache the geocoded coordinates for birth_location so
-- the natal chart endpoint only has to call the geocoder once per profile,
-- not on every chart request.

alter table public.profiles add column if not exists birth_time time;
alter table public.profiles add column if not exists birth_location text;
alter table public.profiles add column if not exists birth_lat numeric;
alter table public.profiles add column if not exists birth_lng numeric;

-- Numerology is a separate, higher subscription tier from the base Long
-- Read ($7/week). 'long_read' = current subscribers (Long Read only);
-- 'long_read_plus_numerology' = the higher tier once its price is set.
-- Defaults existing rows to 'long_read' so nothing changes for current
-- subscribers until the new tier's checkout is wired up.
alter table public.subscriptions add column if not exists tier text not null default 'long_read';

-- Carry birth_time/birth_location from sign-up metadata into the profile
-- row, same pattern as birth_date/gender_identity/sexual_orientation.
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
    id, email, name, role, birth_date, birth_time, birth_location,
    gender_identity, sexual_orientation
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    case when lower(coalesce(new.email, '')) = any (admin_emails) then 'admin' else 'customer' end,
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date,
    nullif(new.raw_user_meta_data ->> 'birth_time', '')::time,
    nullif(new.raw_user_meta_data ->> 'birth_location', ''),
    nullif(new.raw_user_meta_data ->> 'gender_identity', ''),
    nullif(new.raw_user_meta_data ->> 'sexual_orientation', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(public.profiles.name, excluded.name),
        birth_date = coalesce(public.profiles.birth_date, excluded.birth_date),
        birth_time = coalesce(public.profiles.birth_time, excluded.birth_time),
        birth_location = coalesce(public.profiles.birth_location, excluded.birth_location),
        gender_identity = coalesce(public.profiles.gender_identity, excluded.gender_identity),
        sexual_orientation = coalesce(public.profiles.sexual_orientation, excluded.sexual_orientation);
  return new;
end;
$$;
