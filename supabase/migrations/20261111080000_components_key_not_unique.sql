-- Saves upserted new rows before deleting removed ones, so a deleted component and a new one
-- with the same diagram key collided ("duplicate key ... components_key_key").
-- Key uniqueness is enforced by the editor (keys are de-duplicated on save).
alter table public.components drop constraint if exists components_key_key;
