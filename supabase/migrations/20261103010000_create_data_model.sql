-- Feature 2: data model. Tables from PLAN.md section 3.
-- Every table belongs to a user, deletes cascade, and row-level security
-- lets each user read and change only their own rows.

-- ---------- categories ----------
create table public.categories (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  name text not null
);
create index categories_user_id_idx on public.categories (user_id);

-- ---------- pantry_items ----------
create table public.pantry_items (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  category_id bigint not null references public.categories (id) on delete cascade,
  name text not null,
  quantity numeric not null,
  unit text,
  price numeric(10, 2),
  purchased_on date,
  expires_on date,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);
create index pantry_items_user_id_idx on public.pantry_items (user_id);
create index pantry_items_category_id_idx on public.pantry_items (category_id);

-- ---------- recipes ----------
create table public.recipes (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  title text not null,
  ingredients text,
  instructions text,
  created_at timestamptz not null default now()
);
create index recipes_user_id_idx on public.recipes (user_id);

-- ---------- stars (junction: user marks an item as a staple) ----------
create table public.stars (
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  item_id bigint not null references public.pantry_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index stars_item_id_idx on public.stars (item_id);

-- ---------- row-level security ----------
alter table public.categories enable row level security;
alter table public.pantry_items enable row level security;
alter table public.recipes enable row level security;
alter table public.stars enable row level security;

-- categories: own rows only
create policy "Read own categories" on public.categories
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Add own categories" on public.categories
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own categories" on public.categories
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own categories" on public.categories
  for delete to authenticated using ((select auth.uid()) = user_id);

-- pantry_items: own rows only, and the category must be one of the user's own
create policy "Read own items" on public.pantry_items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Add own items" on public.pantry_items
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.categories c
      where c.id = category_id and c.user_id = (select auth.uid())
    )
  );
create policy "Update own items" on public.pantry_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.categories c
      where c.id = category_id and c.user_id = (select auth.uid())
    )
  );
create policy "Delete own items" on public.pantry_items
  for delete to authenticated using ((select auth.uid()) = user_id);

-- recipes: own rows only
create policy "Read own recipes" on public.recipes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Add own recipes" on public.recipes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own recipes" on public.recipes
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own recipes" on public.recipes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- stars: own rows only, and the item must be one of the user's own
create policy "Read own stars" on public.stars
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Add own stars" on public.stars
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.pantry_items i
      where i.id = item_id and i.user_id = (select auth.uid())
    )
  );
create policy "Delete own stars" on public.stars
  for delete to authenticated using ((select auth.uid()) = user_id);
