-- Track who last saved each row, so the editor can show "last edited by" from the database.
-- `on delete set null`: removing an editor account must not be blocked by rows they edited.
do $$
declare t text;
begin
  foreach t in array array['milestones','competitions','components','wiring_links','tuning','photos',
                           'craft_photos','bonus_requests','team','partners','before_after','theme_zones']
  loop
    execute format('alter table public.%I add column if not exists updated_by uuid references auth.users (id) on delete set null', t);
  end loop;
end $$;

alter table public.vehicle drop constraint if exists vehicle_updated_by_fkey;
alter table public.vehicle add constraint vehicle_updated_by_fkey
  foreign key (updated_by) references auth.users (id) on delete set null;

alter table public.judge_evidence drop constraint if exists judge_evidence_updated_by_fkey;
alter table public.judge_evidence add constraint judge_evidence_updated_by_fkey
  foreign key (updated_by) references auth.users (id) on delete set null;
