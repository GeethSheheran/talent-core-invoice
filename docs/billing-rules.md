# Billing rules

## Charges and carry-forward

Only issued, nonvoid invoices create debt. Outstanding = original issued total − allocations from confirmed, nonreversed payments − credit applications. Previous-balance references are captured at issue for communication only and never enter that equation.

October LKR 20,000 − confirmed LKR 10,000 = LKR 10,000 open. November creates LKR 20,000 new debt and displays the earlier LKR 10,000 separately: LKR 30,000 requested, LKR 40,000 issued across both invoices. A reviewed LKR 30,000 payment allocates 10,000/20,000 and settles both. A later payment changes live balances, never the archived November snapshot.

## Project advances

Project LKR 120,000, advance invoice LKR 48,000, remaining charge LKR 72,000. If only LKR 20,000 was paid, LKR 28,000 remains on the advance invoice; total debt after the balance invoice is LKR 100,000. The database caps cumulative issued project charges at agreed project price. Project price excludes separately negotiated adjustments; amend the commercial agreement deliberately rather than bypassing the cap.

## Allocation and correction

Review defaults to oldest due first within the same company/currency. The transaction rechecks live balances, prevents over-allocation, and permits unapplied excess. Confirmation retries return the same confirmed payment/receipt. Applying available payment credit uses a unique operation key. Reversal preserves receipt and allocation history while restoring debt; a reason is required. An invoice with any historical allocation cannot be voided through the simple void path; use reviewed corrections.

Invoice state, delivery state and payment state are distinct. Overdue means issued, positive live balance, and due date before today in Asia/Colombo. Partial payment does not stop follow-ups. Credit corrections reduce outstanding but retain original issued-charge statistics; the UI explicitly labels original billing rather than accounting revenue. Reversed payments leave confirmed collection totals.

## Recurring work

One draft per agreement/first-of-month period. Monthly schedules bill each month; annual schedules bill in the agreement start month each year. Draft edits do not update agreement rows. New service versions apply from the selected period; historical issued invoices and existing drafts remain unchanged. No proration. Billing days 1–28 avoid short-month ambiguity. Archived companies stop generation. The scheduler creates drafts and in-app review notifications at the configured lead date before billing, and attempts missing eligible periods within a 24-month catch-up window; older periods can be generated manually. Failures are recorded for review/retry. Nothing is automatically issued or sent.

## Reminders

Schedules use Colombo calendar dates, not exact elapsed 72-hour timers. Defaults: days 3 and 6 after first successful provider acceptance or explicit external send marking. Failed and mock sends do not start the clock. Resends do not reset it. Due-date basis still requires successful initial send. New rules start tomorrow and do not backfill earlier dates. Unique keys suppress repeated scans. Paid, void and paused invoices stop pending reminders; workers recheck before email. Carry references do not create additional invoice/reminder identities. Only the administrator is emailed.

## Company expenses

Pending reimbursable expenses dated today or earlier are reserved once by the next new draft for the same company/currency. Expense lines are reconstructed from their authoritative records on draft edits. Invoice-wide discounts and tax apply normally. Voiding an eligible invoice releases its expenses for a later draft without changing the archived snapshot. See [expense and recurring invoice workflows](expenses-and-recurring-invoices.md).
