-- Category on each product family (Sports bras, Dresses, T-shirts, …).
-- All is a dial category, not a family, so it is not stored here.
--
-- Apply with the earlier families migration:
--   supabase db push
-- Or paste this file into the Supabase SQL editor and run it.

alter table public.product_families
  add column if not exists category text;

update public.product_families
set category = case style_key
  when 'B-Lift' then 'Sports bras'
  when 'L-Flow' then 'Leggings'
  when 'D-Slip' then 'Dresses'
  when 'J-Glitch' then 'Jerseys'
  else category
end
where style_key in ('B-Lift', 'L-Flow', 'D-Slip', 'J-Glitch');

update public.product_families
set category = 'Shorts'
where style_key like 'S-Glitch%';

update public.product_families
set category = 'T-shirts'
where style_key like 'T-Icon%';
