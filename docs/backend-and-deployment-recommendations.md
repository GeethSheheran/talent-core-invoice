# PostgreSQL, Supabase, and deployment recommendations

Prepared for Document-TC on 22 October 2026.

**Yes, you can use PostgreSQL. Supabase already provides a full PostgreSQL database. My recommendation is to keep Supabase for PostgreSQL, authentication, and private file storage, and deploy the existing Next.js application to Vercel.** This is the simplest path for this project's current architecture. [Supabase database documentation](https://supabase.com/docs/guides/database/overview)

If you mean “replace Supabase with a standalone PostgreSQL database,” that is also possible, but it requires additional development. Changing a database connection string alone would not be enough.

## What this project already uses

The repository contains a billing application for companies, proposals, invoices, payments, receipts, and documents. Its current structure is:

| Component | Responsibility |
| --- | --- |
| Next.js and TypeScript | Application screens, server actions, HTTP routes, and document generation |
| Supabase PostgreSQL | Business records, accounting transactions, database functions, and access policies |
| Supabase Auth | Administrator login and user identity |
| Supabase private Storage | Generated documents and controlled downloads |
| Chromium PDF renderer | Invoice, proposal, receipt, and statement PDFs |
| Email provider | Optional delivery, with mock mode for development |

Supabase is part of the backend; Next.js also runs backend code. The application does not need a separate Express or NestJS server just to use PostgreSQL.

This assessment comes from the repository's dependencies, migrations, administrator checks, financial RPC calls, and existing setup guides. It does not certify the current hosted database or a live deployment.

## Which option should you choose?

These effort ratings are my assessment of this repository, not provider guarantees.

| Option | Development effort | Operational effort | Recommendation |
| --- | --- | --- | --- |
| Managed Supabase + Vercel | Lowest: keep the existing integrations | Lower: configure services and monitor the application | Best starting point |
| Managed Supabase + another Next.js host | Moderate: adapt hosting, PDF runtime, and scheduling | Depends on the host | Reasonable if Vercel does not meet your needs |
| Standalone managed PostgreSQL + replacement services | Higher: replace Supabase-specific integrations | More services to configure and maintain | Consider only for a clear requirement |
| Self-hosted Supabase + application hosting | Moderate to high setup effort | Highest: operate and update the backend stack | Consider when infrastructure control is essential |

Vercel supports Next.js deployment directly. Supabase also supports self-hosting with Docker, but self-hosting means taking responsibility for the running backend services. [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [Supabase self-hosting](https://supabase.com/docs/guides/self-hosting)

## Why standalone PostgreSQL is a larger change

PostgreSQL can store the same business data and execute transactional SQL. However, this application also calls Supabase APIs for authentication, data access, RPCs, and Storage.

Replacing Supabase would require a reviewed plan to:

1. Replace Supabase login, password recovery, session handling, and administrator identity integration.
2. Replace Supabase data API calls with a server-side database access layer.
3. Preserve financial transactions, locking, authorization, and idempotency when moving RPC calls.
4. Adapt migrations and policies that depend on Supabase's Auth and Storage schemas and roles.
5. Replace private file uploads and signed downloads with an object-storage service.
6. Migrate records, user identities, and files, then verify balances and access controls before cutover.

A separate PostgreSQL server is therefore unnecessary if your goal is simply to “use PostgreSQL.” You already have that through Supabase. An ORM is optional; introducing one now would not remove the other Supabase dependencies.

## Recommended development workflow

Use a dedicated hosted development Supabase project if you want to avoid running Docker. Alternatively, use the local Supabase stack with Docker when you want an isolated local environment. Keep production separate from development and preview deployments. Supabase documents migration-based workflows across these environments. [Managing environments](https://supabase.com/docs/guides/deployment/managing-environments)

For this project:

1. Use a Node version supported by `package.json`, npm, the committed lockfile, and pinned dependency versions.
2. Run `npm ci` to install the project's dependencies.
3. If `.env.local` does not exist, create it from `.env.example`. Preserve any existing configuration and supply the development project's values.
4. Follow [Supabase setup](supabase-setup.md) to initialize the database and create the intended administrator. Review and authorize SQL changes before applying them; run the accounting tests for every SQL change.
5. Set `EMAIL_PROVIDER=mock` and `ENABLE_PRODUCTION_JOBS=false` during development.
6. Validate configuration and start the application:

```sh
npm run verify-env
npm run check:supabase
npm run dev
```

Use [the README](../README.md) for the complete local setup, including administrator bootstrap and local Chrome configuration for PDFs. Database reset commands are destructive and belong only in an isolated local development database.

For ongoing feature work, implement one complete workflow at a time: screen, server validation, authorization, database operation, and relevant verification. Keep schema changes in reviewed migration files so environments stay reproducible.

## Recommended deployment workflow

1. **Prepare production Supabase.** Create or verify a separate production project. Inspect its actual migration state, apply authorized migrations, configure Auth URLs, verify private Storage, and activate the intended administrator. Do not assume that a reachable Auth endpoint means the application tables exist.
2. **Prepare the repository.** Put the reviewed application and lockfile in Git and connect the repository to Vercel. Use `npm ci` for installation and `npm run build` for the build.
3. **Configure environment variables.** Supply production values through hosting settings. Only public configuration belongs in `NEXT_PUBLIC_*` variables. Keep `SUPABASE_SECRET_KEY`, email credentials, optional AI keys, and `CRON_SECRET` server-only.
4. **Configure the domain.** Align `APP_URL`, the Supabase Auth site URL, and allowed login/recovery callbacks with the final HTTPS domain.
5. **Validate an isolated preview.** Use a development backend and fictional records there. Test login, invoice issue, payments, reversals, document generation, and private downloads. Do not insert fixture records into production.
6. **Verify the deployed PDF runtime.** Confirm Chromium works within the selected host's resources. A local PDF test alone does not establish that production PDF generation will work.
7. **Enable delivery and scheduled work after acceptance.** Configure the email sender and cron authorization. Use one scheduler to avoid duplicate work; follow the existing deployment guide for this project's job switches.
8. **Prepare recovery.** Set up database backups and separate backups of document file contents. Test restoration into an isolated environment before relying on the recovery plan.

Detailed project instructions: [Vercel deployment](vercel-deployment.md), [email setup](email-setup.md), and [backup and restore](backup-and-restore.md).

## Checks before release

Run the project-required checks in the configured development environment:

```sh
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run test:browser
npm run build
npm run pdf:smoke
```

The integration tests use an isolated PGlite PostgreSQL environment. They are useful accounting checks, but do not establish hosted Auth, Storage, or real multi-connection locking behavior. Complete hosted acceptance and concurrent financial-operation testing before release. See [verification report](verification-report.md).

Preserve these project rules throughout development:

- Check administrator access independently in server actions and HTTP operations, with database access controls as an additional boundary.
- Keep financial mutations in transactional database RPCs; never update authoritative balances using browser arithmetic.
- Store money as integer minor units for the supported two-decimal currencies, within the project's bounds below JavaScript's safe integer limit. For example, LKR 1,250.00 is stored as 125000.
- Require authorization and accounting tests for all SQL changes.
- Keep secrets out of browser bundles and production credentials out of previews.
- Keep fixture data out of production.

## What I suggest doing next

First, complete and verify the current Supabase development setup. The existing setup document records previously missing application tables; that is a historical observation that must be checked against the actual project before taking action.

Next, verify one complete invoice-to-payment-to-receipt workflow, including PDF downloads. Then deploy an isolated Vercel preview and complete the release checks before preparing production.

Keep the current architecture for the first release. Reconsider standalone PostgreSQL only when a specific hosting, control, or integration requirement justifies replacing the existing Supabase services. Choose service plans after checking current commercial terms, database/storage needs, backup coverage, PDF runtime resources, and expected traffic; this document does not assume free plans are sufficient for production.

This guide is a development and deployment recommendation. Creating it did not change SQL, apply migrations, configure hosted services, or deploy the application.
