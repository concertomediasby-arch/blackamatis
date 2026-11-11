-- More cut-out car photos for the landing hero slider, after car_photo_path.
-- [{"id": "...", "kind": "photo", "path": "...", "caption": "..."}], in order; they use car_photo_layout.
alter table public.vehicle add column if not exists hero_photos jsonb default '[]'::jsonb;
