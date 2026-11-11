-- Uploaded system diagram image for the Installation page (shown instead of the generated diagram).
alter table public.vehicle
  add column if not exists system_diagram_path text,
  add column if not exists system_diagram_alt text;
