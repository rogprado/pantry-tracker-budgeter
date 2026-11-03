-- Feature 1: one public.users row per account, created automatically on sign up.

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  monthly_budget numeric(10, 2),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- A user can read only their own row.
create policy "Users can read their own row"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

-- Runs after Supabase Auth creates a login and copies it into public.users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
