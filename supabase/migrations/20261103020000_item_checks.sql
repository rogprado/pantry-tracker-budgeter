-- Feature 4: database-level backup for the form validation.
-- The app already checks these; this stops bad rows even if the form is bypassed.

alter table public.pantry_items
  add constraint pantry_items_name_not_blank check (btrim(name) <> ''),
  add constraint pantry_items_quantity_not_negative check (quantity >= 0),
  add constraint pantry_items_price_not_negative check (price is null or price >= 0);

alter table public.categories
  add constraint categories_name_not_blank check (btrim(name) <> '');
