-- Hero car photo position and size, per screen size: {"desktop": {"x","y","scale"}, "mobile": {...}}
alter table public.vehicle add column if not exists car_photo_layout jsonb;
