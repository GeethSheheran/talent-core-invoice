# Ledger · Admin billing

Private, single-business invoice, proposal and payment administration. Next.js App Router, TypeScript, React, Tailwind, Supabase Auth/Postgres/private Storage. LKR and Asia/Colombo defaults. There is no client portal, payment gateway, or live deployment.

## Local setup

Requires Node 22.17+ (or Node 24+) and npm. Full local Supabase also requires Docker. The workspace can show its setup screen without credentials; operational pages require an approved administrator.

```sh
npm ci
cp .env.example .env.local
npx supabase start
npx supabase db reset --local
npx supabase status
```

**`db reset --local` destroys only the isolated local development database. Never use `--linked` or a production URL for test/reset commands.** Copy the local URL, publishable/anon key and secret/service-role key from the status output into `.env.local`. Keep those values private. Local legacy anon/service-role keys work with the configured variable names. If Docker is unavailable, use a separate development Supabase project and apply the migration files in chronological order using its SQL editor or a reviewed CLI migration push; do not point tests at production.

Set Auth site URL to `http://localhost:3000` and redirect allowlist to `http://localhost:3000/auth/callback` and the recovery callback URL. Signup is disabled. In local Studio (URL reported by `supabase status`), create your administrator under Authentication → Users, with an email and password you choose. Set `BOOTSTRAP_ADMIN_EMAIL` to that exact email in `.env.local`.

```sh
npm run verify-env
npm run check:supabase
npm run bootstrap-admin
npm run db:types
npm run dev
```

Visit http://localhost:3000. Sign in, complete Settings, create a company, then create an invoice draft. Review and issue it; generate the PDF separately. Add a pending payment and confirm the reviewed allocations to obtain a receipt. Generation failures retain the original snapshot and number for retry.

For local PDF rendering, set `CHROME_EXECUTABLE_PATH` to your installed Chrome/Chromium binary (for example `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` on macOS). Production uses the packaged serverless Chromium adapter. Brand asset paths are configurable; start with `public/brand/README.md`.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run test:browser
npm run pdf:smoke
npm run build
npm start
```

Integration tests create a new in-memory PGlite PostgreSQL instance, apply the actual migrations, and discard it afterward. Auth/storage platform schemas are minimal test fixtures. This verifies database accounting and RLS behavior without a remote project; it does not prove GoTrue sessions, hosted Storage policies, or real multi-connection locking. Database types are generated from those applied migrations, not handwritten `any` models. See [verification report](docs/verification-report.md) for exact evidence and limitations.

Browser tests use local Chrome by default; set `CHROME_EXECUTABLE_PATH` for other systems. The default browser suite verifies the unconfigured setup and anonymous access protection. Configure isolated Auth/Storage and complete the authenticated acceptance checklist before release. Generated test PDFs/screenshots stay in ignored `.artifacts/`.

## How the workflows fit together

- Companies retain immutable codes; archiving preserves financial history and stops future monthly drafts.
- Recurring agreements use dated service versions. Invoice edits affect that draft only; agreement edits affect selected future months. Generation is idempotent and never sends invoices automatically.
- Numbering, issue snapshots, confirmations, allocations, reversals and credit corrections run in locked database transactions. Only approved administrators can call financial RPCs.
- Prior unpaid invoices are references, not new line items. Project balance invoices deduct previously billed amounts, not payments. Unallocated confirmed payments stay separate from credit notes.
- PDFs use trusted React templates and private storage. Statements show current balances. Downloads do not confirm payments.
- Email defaults to mock mode. Notifications → Process pending jobs can exercise delivery locally. Resend is configured only through environment variables, with a development recipient override. Production scheduling needs an explicit enable switch and cron secret.
- Proposals support pasted notes and PDF, DOCX, or text import. Optional OpenAI drafting produces a preview for review before replacing editable sections. Set AI_PROVIDER=openai and OPENAI_API_KEY server-side to enable it; manual editing needs no AI credentials. See [proposal drafting setup](docs/proposal-drafting.md). Accepted proposals can prefill an agreement for review.

The implemented route structure consolidates related CRUD screens under `[collection]` instead of duplicating nearly identical pages. The initial three migrations consolidate the seven suggested migration groups; subsequent migrations add reviewed features. [Final file manifest and responsibilities](docs/project-structure.md) describe the actual structure.

## Company expenses and recurring invoices

Record reimbursable company expenses for automatic inclusion in the next new draft. Choose an invoice month and monthly or annual repetition when creating an invoice. Settings controls the billing day and advance notification; drafts remain subject to review before issue/send. See [expense and recurring invoice workflows](docs/expenses-and-recurring-invoices.md), including the required database migration.

## Deployment and operation

Follow [Supabase setup](docs/supabase-setup.md), [Vercel deployment](docs/vercel-deployment.md), [email setup](docs/email-setup.md), and [backup and restore](docs/backup-and-restore.md). No hosted resources were created, no credentials were supplied, and no real messages or invoices were sent during development.
