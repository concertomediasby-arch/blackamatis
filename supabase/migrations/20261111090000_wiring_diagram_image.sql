-- Uploaded cable / wiring diagram image for the Installation page (Power & fuses),
-- with clickable areas per component, like the system diagram image.
alter table public.vehicle
  add column if not exists wiring_diagram_path text,
  add column if not exists wiring_diagram_alt text;

-- [{"x": 12.5, "y": 30, "w": 8, "h": 10}, ...] in percent of the wiring image.
-- Nullable: an editor still on older code sends rows without this field.
alter table public.components add column if not exists wiring_hotspots jsonb default '[]'::jsonb;

-- Capacitors / power banks and other parts (relay, LED, ...) that appear on the wiring diagram.
alter table public.components drop constraint if exists components_type_check;
alter table public.components add constraint components_type_check
  check (type in ('head_unit', 'dsp', 'amplifier', 'speaker', 'battery', 'main_fuse', 'distribution', 'capacitor', 'other'));
