# Company expenses and recurring invoices

## Record a company expense

Open **Expenses → New expense**, or open a company and use **Expenses → New**. Enter the description, amount, currency, and date incurred.

Pending expenses dated today or earlier are automatically included in the next **new draft** for that company and currency, whether created manually or by the recurring scheduler. The form previews eligible expenses; the database determines the final saved rows and total. Review the saved draft before issuing it.

- Each expense is attached to one invoice at a time. Saving or editing that invoice does not add it again.
- An expense added after a draft was created waits for the next new draft. Existing drafts are not silently changed.
- Pending expenses can be edited. Attached expenses are read-only and link to their invoice.
- Future-dated expenses wait until their expense date. Expenses in another currency wait for a matching invoice; no exchange conversion is performed.
- To create an expense-only invoice, remove the empty service row before reviewing the draft.
- Invoice-wide tax and discounts apply to expense rows too. Existing project charge limits still apply to the invoice total.
- Voiding an eligible issued invoice returns its expenses to pending while retaining the old invoice items and snapshot. Payment reversals and credit corrections do not automatically rebill expenses.

These are reimbursable client expenses, not a general business accounts-payable ledger.

## Select the invoice month and repeat interval

When creating an invoice, use **Invoice for month** to select its billing month. The month is stored as its first day and appears in the invoice preview/PDF. **Payment due date** remains a separate field.

Choose **Repeat invoice**:

- **none**: create only this invoice.
- **monthly**: create a schedule for the same services every month.
- **annually**: create a schedule for the same services in the selected month each year.

A repeating invoice needs a billing month and at least one service row. The initial draft is linked to an agreement, so the scheduler will not generate it twice. Future invoices copy the service template, discount, tax rate, and notes. Expense rows are included once and do not become repeating services.

Use **Manage recurring schedule** on the invoice to open its agreement. Change the repeat interval, future service version, optional billing-day/notice overrides, or end date there. Clear **Active agreement** to stop future generation. Draft edits affect only that invoice. Existing drafts and issued documents are preserved when schedule settings change.

Annual schedules use the agreement's start month as their anchor. The start date is fixed after creation; create a new agreement if a different anchor is required. Generate a missed period manually from the agreement using **Generate recurring draft**.

## Configure the billing date and advance notification

In **Settings**:

- **Recurring invoice billing day (1–28)** chooses the day of the month. Default: 1. Days 1–28 avoid short-month ambiguity.
- **Notify days before a new invoice** chooses how far ahead to create a draft and its in-app notification. Default: 7; allowed range: 0–365.

Example: billing day **10**, advance notice **5**, company payment terms **14 days**. The November draft and notification become eligible on **5 November**, the notification asks you to review and send by **10 November**, and the generated payment due date is **24 November**.

New schedules created from invoices use these defaults. In an agreement, leave the billing-day and reminder-day overrides blank to follow Settings. Existing agreements retain their previous explicit billing day; clear that override if they should follow the global setting.

The existing daily scheduler creates drafts and notifications in **Notifications**. It uses Asia/Colombo calendar dates, catches up missed eligible periods within the existing 24-month window, and avoids duplicate drafts and notifications. It must actually run for automation to occur; changing Settings alone does not invoke it. Large notice windows may prepare multiple monthly drafts in advance.

Upcoming billing notifications are in-app notifications. They are separate from the existing unpaid-invoice follow-up rules. Invoices are never automatically issued or emailed: review, issue, generate the PDF, and send using the existing workflow.

## Database rollout

The feature requires the new migration:

`supabase/migrations/20261022112205_expenses_and_recurring_schedules.sql`

For an initialized database, review and apply this migration after the existing three migrations. Do not rerun the initial setup bundle against an existing database. Follow [Supabase setup](supabase-setup.md) for migration history checks, especially if the initial schema was applied through SQL Editor.

Deploy the database migration before the application version that reads the new expense table and agreement fields. Verify the feature in an isolated hosted environment before production, including real concurrent draft creation and Auth/Storage access. No hosted migration or deployment was performed while implementing this feature.

The migration keeps administrator-only reads, RPC-only writes, integer minor-unit amounts, and company-level transaction locks. New accounting tests cover expense reservation, rollback, currency isolation, invoice snapshots, void/rebill behavior, monthly and annual scheduling, settings overrides, permissions, and repeat scans. PGlite tests do not establish real multi-connection locking behavior on hosted PostgreSQL.
