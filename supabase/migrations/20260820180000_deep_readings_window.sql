-- Three time-windowed Long Reads per day (morning / midday / evening).
-- One row per user per calendar day per window; enforced in the API.

alter table public.deep_readings
  add column if not exists window text;

comment on column public.deep_readings.window is
  'Daily slot: morning | midday | evening. Null for legacy rows before the three-slot model.';

create index if not exists deep_readings_user_day_window_idx
  on public.deep_readings (user_id, created_at desc, window);
