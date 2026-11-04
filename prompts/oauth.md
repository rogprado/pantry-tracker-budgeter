# Log in with Google and GitHub

## 2026-11-03

can you add google and github login as well?

### Summary
Added "Continue with Google" and "Continue with GitHub" above the email form on login and sign-up, with an "or use your email" divider. A server action (`signInWithProvider` in `app/auth/actions.ts`) asks Supabase for the provider's sign-in URL and redirects there; the provider sends the browser back to the existing `/auth/callback`, which now also handles provider errors (cancel, denied) with a friendly "That sign-in didn't go through" notice on /login. New users get their `public.users` row from the existing sign-up trigger, so nothing changes in the database.
Checked: both buttons reach Supabase's authorize endpoint, which answers "provider is not enabled" until Google and GitHub are configured; the full 14-step click-through and `npm test` pass. My click-through script broke at first because it clicked the first submit button (now "Continue with Google"); fixed the script to click "Log in". The real Google/GitHub round trip can only be tested after the user sets up the providers.
