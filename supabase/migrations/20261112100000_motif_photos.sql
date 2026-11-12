-- Theme › Motifs: several photos (e.g. both sides of the car), each motif placed on one of them
-- (motifs[].photo = index into motif_photos). The first photo stays in motif_photo_path as well.
alter table public.vehicle add column if not exists motif_photos jsonb not null default '[]'::jsonb;
update public.vehicle
   set motif_photos = jsonb_build_array(motif_photo_path)
 where motif_photo_path is not null and motif_photos = '[]'::jsonb;
