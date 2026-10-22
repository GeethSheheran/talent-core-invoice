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

The configured hosted project's Auth endpoint and JWKS are reachable, but the application tables were missing at the last check. Connector permissions prevent remote migration execution and verification here. PGlite tests cover SQL/RLS and the generated setup bundle; hosted Auth/Storage integration and Supabase advisors remain unverified. SQL activation grants application access; connector authorization is separate.
