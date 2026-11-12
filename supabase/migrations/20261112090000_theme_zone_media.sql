-- Theme zones: several photos / videos per zone (slider in the card), and zones
-- the team adds itself beyond Exterior, Interior and Trunk.
alter table public.theme_zones add column if not exists media jsonb not null default '[]'::jsonb;
alter table public.theme_zones drop constraint if exists theme_zones_key_check;
-- Existing single photos become the first slide.
update public.theme_zones
   set media = jsonb_build_array(jsonb_build_object('id', 'cover', 'kind', 'photo', 'path', photo_path, 'url', null, 'caption', ''))
 where photo_path is not null and media = '[]'::jsonb;
