# Company agreed services

The **Services** page is the shared catalogue. Add a main service or a sub-service, its currency, default rate and monthly/one-time frequency. A main service can have multiple sub-services; deeper nesting is not supported. Archive services instead of deleting their history.

Open **Companies → a company → Agreed services → Add agreed services**. Select the catalogue services agreed with that client, set quantities, agreed rates, line discounts and billing frequencies. No separate name is needed: selected service names identify the selection. A main service or any sub-service can be selected independently. Both line and full-service discounts have Amount and Percentage options. Percentages allow two decimal places from 0 to 100 and are applied to the whole line (or the total after line discounts), with currency rounding. The selected option and value are saved and restored when editing. The full-service discount is apportioned across the remaining line amounts, with exact minor-unit rounding. Only the monthly portion repeats. Values in forms are major currency units; saved amounts are integer minor units.

There is no standalone Services & Packages list or navigation item. The internal `projects` table and record routes are retained for compatibility with existing documents and legacy advances/balances.

## Invoices and recurring drafts

Use **Create service invoice** from the company’s agreed-services details, or select the company’s agreed services in a new invoice. When only one active selection exists, it is selected automatically. The database loads its services and discounts; frontend calculations are previews only. Pending expenses continue to attach once. Monthly drafts use the company’s payment terms and the billing day in Settings. Review the saved draft before issuing; edit that draft for invoice-specific notes, tax or adjustments.

Saving monthly agreed services creates a managed monthly schedule. The existing daily cron creates eligible drafts and notifications; it never issues or sends an invoice. Each schedule has at most one invoice per month. Selecting a month already generated opens that invoice. One-time service identifiers are reserved by draft and issued invoices, so additional drafts cannot bill them again. Voiding an unallocated issued invoice makes its one-time services eligible again. One-time-only selections do not create a recurring schedule.

Edit agreed services from the company tab to change future drafts. Existing drafts and issued snapshots remain unchanged. Mark the selection completed or archived to stop its schedule. Editing a managed agreement redirects to the company’s agreed-services editor. Legacy manually configured agreements continue to use their existing versioned service lists.

## Payments and receipts

Record the actual amount received, including partial or excess payments. On confirmation, review the oldest-first invoice allocation. Unallocated confirmed payments remain company credit in the same currency.

Issuing the next invoice applies available credit inside the same transaction and records the applied amount and remaining balance in its snapshot. Retries cannot spend the same credit twice. Earlier unpaid invoice balances are referenced separately, not copied into new charges. Receipts, issued snapshots and historical PDFs stay fixed after later payments or reversals; current balances and statements reflect those changes.

## Rollout

Apply `supabase/migrations/20261029130000_services_hierarchy_packages_and_credit_rollover.sql` after the existing migrations, followed by `supabase/migrations/20261029130001_agreed_service_discount_options.sql`, before deploying the application. This completes the previously unfinished, uncommitted migration. Confirm it has not already been applied under that version before deployment; do not replace an applied migration in production history.

No hosted database change or deployment was performed during implementation. The existing daily cron must be configured and running for automatic monthly drafts. Local PGlite tests execute the migrations and cover accounting and authorization, but do not establish real multi-connection locking behavior on hosted PostgreSQL. Verify concurrent issuance and generation in staging before production rollout.
