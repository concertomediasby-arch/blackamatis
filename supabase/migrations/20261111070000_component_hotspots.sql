-- Clickable areas on the uploaded system diagram image, per component:
-- [{"x": 12.5, "y": 30, "w": 8, "h": 10}, ...] in percent of the image.
alter table public.components add column if not exists hotspots jsonb not null default '[]'::jsonb;
