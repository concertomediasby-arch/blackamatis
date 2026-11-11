-- Large photo of the car under the story on the History page, with its caption.
alter table public.vehicle
  add column if not exists history_photo_path text,
  add column if not exists history_photo_caption text;
