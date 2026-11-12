-- Headline / intro placement for Installation, Bonus Point and Judge Mode:
-- {installation: {...}, bonus: {...}, judge: {...}}, same shape as history_layout.
alter table public.vehicle add column if not exists page_layouts jsonb;
