-- The AI-written natal personality-profile narrative previously regenerated
-- (a Gemini call) on every single visit to the Chart page — expensive and,
-- combined with numerology/tarot on the same shared free-tier Gemini key,
-- a contributor to the 20-requests/day quota getting exhausted.
--
-- The narrative is deterministic-ish per birth-data set (same chart in,
-- same synthesis out), so write it once and reuse it. natal_profile_source_key
-- is a snapshot of the birth inputs (birth_date|birth_time|lat|lng) that
-- produced the cached narrative — if the user later edits their birth
-- details, the key no longer matches and the profile regenerates once.

alter table public.profiles add column if not exists natal_profile_narrative text;
alter table public.profiles add column if not exists natal_profile_source_key text;
