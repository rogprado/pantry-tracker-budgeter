-- Quick quantity updates: a log of every "use" or "purchase", and two functions that
-- change an item's quantity and write the log row in one transaction.
-- Both functions run as the signed-in user (security invoker), so row-level security applies.

create table public.stock_movements (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  item_id bigint not null references public.pantry_items (id) on delete cascade,
  kind text not null check (kind in ('use', 'purchase')),
  amount numeric not null check (amount > 0),
  -- What the item looked like before, so Undo can put it back exactly.
  quantity_before numeric not null,
  in_stock_before boolean not null,
  created_at timestamptz not null default now()
);
create index stock_movements_user_id_idx on public.stock_movements (user_id);
create index stock_movements_item_id_idx on public.stock_movements (item_id, created_at desc);

alter table public.stock_movements enable row level security;

create policy "Read own movements" on public.stock_movements
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Add own movements" on public.stock_movements
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.pantry_items i where i.id = item_id and i.user_id = (select auth.uid()))
  );
create policy "Delete own movements" on public.stock_movements
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Use or buy some of an item: logs the movement and updates quantity and in-stock together.
-- Using never goes below 0; reaching 0 marks the item out of stock. Buying marks it in stock.
create function public.record_movement(p_item_id bigint, p_kind text, p_amount numeric)
returns public.stock_movements
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item public.pantry_items;
  moved numeric;
  new_quantity numeric;
  result public.stock_movements;
begin
  if p_kind not in ('use', 'purchase') or p_amount is null or p_amount <= 0 then
    raise exception 'invalid movement' using errcode = '22023';
  end if;

  select * into item from public.pantry_items where id = p_item_id for update;
  if not found then
    raise exception 'item not found' using errcode = 'P0002';
  end if;

  if p_kind = 'use' then
    if item.quantity <= 0 then
      raise exception 'nothing left to use' using errcode = '22023';
    end if;
    moved := least(p_amount, item.quantity);
    new_quantity := item.quantity - moved;
  else
    moved := p_amount;
    new_quantity := item.quantity + moved;
  end if;

  insert into public.stock_movements (item_id, kind, amount, quantity_before, in_stock_before)
  values (p_item_id, p_kind, moved, item.quantity, item.in_stock)
  returning * into result;

  update public.pantry_items
  set quantity = new_quantity,
      in_stock = case when p_kind = 'purchase' then true else new_quantity > 0 end
  where id = p_item_id;

  return result;
end;
$$;

-- Undo: put the item back exactly as it was before the movement, and remove the log row.
create function public.undo_movement(p_movement_id bigint)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  moved public.stock_movements;
begin
  select * into moved from public.stock_movements where id = p_movement_id;
  if not found then
    raise exception 'movement not found' using errcode = 'P0002';
  end if;

  update public.pantry_items
  set quantity = moved.quantity_before, in_stock = moved.in_stock_before
  where id = moved.item_id;

  delete from public.stock_movements where id = p_movement_id;
end;
$$;

revoke execute on function public.record_movement(bigint, text, numeric) from public, anon;
revoke execute on function public.undo_movement(bigint) from public, anon;
grant execute on function public.record_movement(bigint, text, numeric) to authenticated;
grant execute on function public.undo_movement(bigint) to authenticated;
