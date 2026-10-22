# Project structure

The selected workspace itself is the application root. The implementation consolidates the brief's suggested duplicate CRUD routes and low-level wrappers into shared working modules. There are no empty feature implementation files.

## Responsibilities

- `src/app/(admin)/[collection]`: searchable/paginated lists, new/edit forms, record details and previews for companies, services, projects, agreements, proposals, invoices, payments and notifications. Explicit dashboard/settings routes handle aggregate and workspace views.
- `src/app/(auth)` and `src/proxy.ts`: password login/recovery, session refresh and sign-out; the admin layout and each operation independently authorize membership.
- `src/components`: reusable editors, review steps, financial allocation/confirmation forms, document actions, shell, tables, branding and reminders.
- `src/lib/billing`, `validation`, `dashboard`, `notifications`: exact calculations, typed input contracts, currency-separated reporting, scheduling and bounded delivery workers.
- `src/lib/db`: migration-generated Supabase types and authorized repositories. Transactional financial persistence is in SQL RPCs rather than duplicated TypeScript calculations.
- `src/lib/documents` and `templates/documents/document.tsx`: shared validated brand/snapshot contract, the single invoice template and related document variants, trusted PDF renderer and private archival.
- `src/lib/email` and `proposals`: mock/Resend email adapters, document text extraction, and optional OpenAI proposal drafting with validated output.
- `supabase/migrations`: core schema/domain helpers; approved-admin financial transactions; jobs, delivery, RLS and private storage. Three sequential migrations consolidate the seven conceptual groups in the brief.
- `scripts`: schema-derived type generation, environment validation and privileged CLI-only admin bootstrap.
- `tests`: domain/provider tests, real migration/RLS tests in isolated PGlite, anonymous browser/security tests and actual multipage PDF rendering.
- `docs`, `prompts`, `config`, `public/brand`: operations, proposal instructions, validated brand defaults and configurable original assets.

## Final file manifest

Generated build output, dependencies, test artifacts, temporary CLI state and TypeScript caches are excluded below.

```text
.env.example
.gitignore
.prettierignore
AGENTS.md
README.md
config/brand.json
config/brand.schema.ts
docs/backup-and-restore.md
docs/billing-rules.md
docs/data-model.md
docs/email-setup.md
docs/pdf-templates.md
docs/project-structure.md
docs/reference-review.md
docs/supabase-setup.md
docs/vercel-deployment.md
docs/verification-report.md
eslint.config.mjs
next-env.d.ts
next.config.ts
package-lock.json
package.json
playwright.config.ts
postcss.config.mjs
prompts/proposal-generation.md
prompts/proposal-revision.md
public/brand/README.md
public/brand/fonts/.gitkeep
public/brand/icons/.gitkeep
public/brand/images/.gitkeep
public/brand/logos/.gitkeep
references/README.md
scripts/bootstrap-admin.ts
scripts/check-supabase.ts
scripts/generate-db-types.ts
scripts/verify-env.ts
src/app/(admin)/[collection]/[id]/edit/page.tsx
src/app/(admin)/[collection]/[id]/page.tsx
src/app/(admin)/[collection]/[id]/preview/page.tsx
src/app/(admin)/[collection]/new/page.tsx
src/app/(admin)/[collection]/page.tsx
src/app/(admin)/actions.ts
src/app/(admin)/dashboard/page.tsx
src/app/(admin)/layout.tsx
src/app/(admin)/loading.tsx
src/app/(admin)/settings/page.tsx
src/app/(auth)/login/actions.ts
src/app/(auth)/login/page.tsx
src/app/(auth)/recover/page.tsx
src/app/(auth)/reset-password/page.tsx
src/app/api/companies/[id]/statement/route.ts
src/app/api/cron/daily/route.ts
src/app/api/documents/[id]/download/route.ts
src/app/api/invoices/[id]/pdf/route.ts
src/app/api/invoices/[id]/send/route.ts
src/app/api/payments/[id]/receipt/route.ts
src/app/api/proposals/[id]/draft/route.ts
src/app/api/proposals/[id]/pdf/route.ts
src/app/api/webhooks/email/route.ts
src/app/auth/callback/route.ts
src/app/error.tsx
src/app/globals.css
src/app/layout.tsx
src/app/not-found.tsx
src/app/page.tsx
src/components/auth-form.tsx
src/components/brand-settings.tsx
src/components/document-button.tsx
src/components/financial-form.tsx
src/components/layout/sidebar.tsx
src/components/record-editor.tsx
src/components/records-table.tsx
src/components/reminder-settings.tsx
src/components/ui/empty-state.tsx
src/components/ui/status-badge.tsx
src/instrumentation.ts
src/lib/auth/require-admin.ts
src/lib/billing/advances.ts
src/lib/billing/allocations.ts
src/lib/billing/money.ts
src/lib/billing/status.ts
src/lib/billing/totals.ts
src/lib/dashboard/metrics.ts
src/lib/db/database.types.ts
src/lib/db/repositories/records.ts
src/lib/documents/brand.ts
src/lib/documents/render-pdf.ts
src/lib/documents/snapshots.ts
src/lib/documents/storage.ts
src/lib/email/provider.ts
src/lib/env.ts
src/lib/http.ts
src/lib/notifications/outbox.ts
src/lib/notifications/rules.ts
src/lib/proposals/provider.ts
src/lib/supabase/browser.ts
src/lib/supabase/privileged.ts
src/lib/supabase/server.ts
src/lib/utils/dates.ts
src/lib/validation/schemas.ts
src/proxy.ts
supabase/config.toml
supabase/migrations/20261013140752_core.sql
supabase/migrations/20261013140753_transactions.sql
supabase/migrations/20261013140754_jobs_and_security.sql
supabase/seed.sql
templates/documents/document.tsx
tests/e2e/admin-billing.spec.ts
tests/fixtures/billing.ts
tests/fixtures/database.ts
tests/fixtures/server-only.ts
tests/integration/billing.test.ts
tests/integration/jobs.test.ts
tests/pdf/render.test.ts
tests/unit/domain.test.ts
tests/unit/email.test.ts
tsconfig.json
vercel.json
vitest.config.ts
```
