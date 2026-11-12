-- Square tiles of photos / videos under the History slider: [{id, kind, path, url, caption}].
alter table public.vehicle add column if not exists history_gallery jsonb not null default '[]'::jsonb;
