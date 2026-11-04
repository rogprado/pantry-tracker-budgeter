-- Feature 10: let each user change their own monthly budget, and nothing else on their row.

-- Row-level security: only your own row.
create policy "Users can update their own row"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Column-level permission: of the users columns, only monthly_budget can be changed from the app.
revoke update on public.users from anon, authenticated;
grant update (monthly_budget) on public.users to authenticated;

-- A budget is empty (no budget) or a positive amount.
alter table public.users
  add constraint users_monthly_budget_positive check (monthly_budget is null or monthly_budget > 0);
