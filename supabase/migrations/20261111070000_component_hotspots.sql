-- Clickable areas on the uploaded system diagram image, per component:
-- [{"x": 12.5, "y": 30, "w": 8, "h": 10}, ...] in percent of the image.
-- Nullable on purpose: an editor still running older code sends rows without this field;
-- the app treats null as "no areas".
alter table public.components add column if not exists hotspots jsonb default '[]'::jsonb;
alter table public.components alter column hotspots drop not null;
