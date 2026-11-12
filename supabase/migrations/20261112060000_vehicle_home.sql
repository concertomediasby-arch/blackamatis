-- Landing-page text and options: {eyebrow, title, intro, cta, show_strip}. Empty text = default.
alter table public.vehicle add column if not exists home jsonb;
