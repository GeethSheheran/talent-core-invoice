# Supabase setup

1. Create a separate development Supabase project, or install Docker and run `npx supabase start`. Local configuration is checked in; signup is disabled and the seed has no operational data.
2. Apply the SQL migrations in filename order. For an isolated local database use `npx supabase db reset --local`. For a remote project review the SQL first, then use SQL editor or `supabase db push` after explicitly linking the correct project; inspect CLI help before use. Never reset a live database.
3. Verify all public tables have RLS enabled, the invoice_balances view is security_invoker, and the documents bucket is private. Anonymous access must fail. Run Supabase security advisors on the configured project before release.
4. Disable email signup and anonymous signup in the Auth dashboard. Configure exact site URL and `/auth/callback` redirect URLs for development and production, including `/auth/callback?next=/reset-password`. Do not allow arbitrary redirect hosts.
5. Create the administrator Auth user in the dashboard. Supply their email through BOOTSTRAP_ADMIN_EMAIL; run `npm run bootstrap-admin` with the project secret key in `.env.local`. The script only activates membership for an existing matching user. There is no bootstrap HTTP endpoint and no committed password.
6. Set publishable configuration for the browser and the secret key server-side. `npm run verify-env` checks names without printing values. Verify login, sign-out, recovery email/callback and password update against this isolated project.
7. Generate types with `npm run db:types`. This project introspects a clean PGlite instance running the migrations for a reproducible offline schema contract. You may additionally compare with `npx supabase gen types typescript --local` against the full local stack.

Next.js 16 uses proxy.ts for session refresh. Interactive authorization calls Auth getUser and checks active protected membership on each operation; it never relies on user_metadata or getSession alone. RLS adds a separate database boundary. See [Supabase SSR documentation](https://supabase.com/docs/guides/auth/server-side/creating-a-client) and [RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security).

For first-time setup through SQL Editor, set `BOOTSTRAP_ADMIN_EMAIL` in `.env.local`, then run:

```sh
node --env-file=.env.local --import tsx scripts/prepare-sql-editor.ts
```

Open `.artifacts/supabase-setup.sql`, copy the entire file into the correct project's SQL Editor, and run as `postgres`. It applies all migrations and activates the existing Auth account in one transaction. The final result must show the designated email and `active = true`. It contains no API keys or passwords. This is a one-time setup: existing application objects cause a rollback; do not drop tables to rerun it. For an already initialized database, use `.artifacts/activate-admin.sql` instead; activation is safe to repeat. Sign in with the account's existing password afterward.

SQL Editor does not record CLI migration history. Before subsequently using `db push`, verify the applied schema and reconcile these migration versions with `supabase migration repair` (inspect command help first).

## Expenses unavailable / company page errors

Run `npm run check:supabase`. A `PGRST205` response for `company_expenses` means the table is unavailable in the Data API schema. Do not treat this as an empty expenses list: invoice creation needs the table to include pending costs correctly.

For an existing installation that already has the three core migrations, review and apply only `supabase/migrations/20261022112205_expenses_and_recurring_schedules.sql` to the configured project. It creates company expenses and updates the transactional billing functions and recurring schedule fields. Back up the database and verify the migration has not already been applied before executing it; it is not a repeatable setup script. Do not rerun the full first-time setup or reset the database. Run `npm run test:integration` before applying, then `npm run check:supabase` afterward and verify expenses/invoice creation with an administrator session.

At the 2026-10-27 check, Auth and JWKS responded successfully, the expenses API returned `404 / PGRST205`, and all server-key schema probes returned `401`. Update `SUPABASE_SECRET_KEY` in `.env.local` with a valid server secret for the same project (never expose it in browser configuration), then restart the app. The connected Supabase account cannot access this configured project, so remote migration execution remains blocked. SQL administrator activation grants application access; connector authorization is separate.

Company sections load independently. An unavailable expense section shows a setup message without preventing the company overview, payments, or other available sections from opening. Invoice creation is intentionally blocked until pending expenses can be read; it must never silently omit existing costs.

## Attach new expenses to an existing draft

Apply `supabase/migrations/20261027093351_attach_pending_expenses.sql` after the expenses and recurring schedules migration. This adds the administrator-only `attach_pending_expenses` RPC; it does not modify existing records during deployment. The company invoice popup lists matching, unassigned expenses incurred by today in Asia/Colombo. Clicking **Add these expenses to invoice** attaches the reviewed costs and recalculates totals in one transaction. Changed amounts, another invoice's expenses, and issued invoices are rejected. Retries cannot add the same expense twice.

The migration is tested locally, but has not been applied to the hosted project through this connection because project access is denied. Run the migration in the owning project's SQL Editor, or authorize the owning Supabase connection, before using the new attachment action.
