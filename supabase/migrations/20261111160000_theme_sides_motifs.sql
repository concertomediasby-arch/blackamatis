-- Theme page: a photo and short points per side, and the motif map
-- (one photo of the car with numbered points, each with a title and its meaning).
alter table public.vehicle
  add column if not exists dark_side_photo_path text,
  add column if not exists light_side_photo_path text,
  add column if not exists dark_side_points jsonb default '[]'::jsonb,
  add column if not exists light_side_points jsonb default '[]'::jsonb,
  add column if not exists motif_photo_path text,
  add column if not exists motifs jsonb default '[]'::jsonb;
-- motifs: [{"id": "...", "title": "...", "meaning": "...", "x": 0-100, "y": 0-100}] (point in % of the photo)
