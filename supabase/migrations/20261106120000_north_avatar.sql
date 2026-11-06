-- Optional True North avatar fields.
-- The app stores the portrait in local storage either way, and ignores
-- a missing-column error when this migration has not been applied yet.

alter table public.profiles add column if not exists north_photo_url text;
alter table public.profiles add column if not exists north_ai_avatar_url text;
alter table public.profiles add column if not exists north_avatar_mode text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_north_avatar_mode_check') then
    alter table public.profiles
      add constraint profiles_north_avatar_mode_check
      check (north_avatar_mode is null or north_avatar_mode in ('ai', 'original'));
  end if;
end $$;
