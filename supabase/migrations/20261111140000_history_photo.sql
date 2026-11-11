-- Photos of the car under the story on the History page, shown as a slider.
-- [{"id": "...", "kind": "photo", "path": "...", "caption": "..."}], in order.
alter table public.vehicle add column if not exists history_photos jsonb default '[]'::jsonb;
-- Replaced by history_photos before any release (never used by the site).
alter table public.vehicle
  drop column if exists history_photo_path,
  drop column if exists history_photo_caption;
