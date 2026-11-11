-- Which component a photo-log photo shows (diagram key), so the cable diagram's
-- circuit card can list the proof photos along a power path. Optional.
alter table public.photos add column if not exists component_key text;
