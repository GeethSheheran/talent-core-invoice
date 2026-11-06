# Ledger dashboard and workbook catalogue

The dashboard is designed for owners, finance staff and sales staff using the
existing administrator access model. It does not introduce new permissions.

Owners see money collected and invoices issued this month, total customer debt,
and the overdue portion. Finance sees debt ageing and the oldest overdue invoices
with direct links. Sales sees issued proposals awaiting a decision and their
potential value. Card-header arrows open the invoice and proposal pages. Issued proposal values are
not counted as earned revenue. Voided/draft invoices and other currencies do not
contribute to debt ageing. Confirmed payments use received dates; billing uses
issue dates, with the existing Asia/Colombo month boundaries.

Amounts at or above one million major units use M (e.g. LKR 1.25M); smaller amounts
retain their normal currency format. Exact summary amounts remain in hover titles
and accessible labels. The dashboard omits the date eyebrow, introductory copy,
next-steps section, exact-figures disclosure, section eyebrows and footer notes.
The app does not have bank reconciliation or full expense accounting, so it does
not claim to show bank balance, profit, or a cash-flow forecast.

The dashboard no longer includes the notification feed. The bell checks for new
activity on entry, every minute while the tab is visible, and on returning to the
tab. A dot means there are items not seen since the panel was last opened in this
browser. Seen IDs are scoped to the signed-in administrator in browser storage;
this is not a cross-device read receipt. Failed requests do not mark items seen.

## Research applied

- [Xero sales overview](https://central.xero.com/0/article/Sales-dashboard):
  highlight customers needing follow-up and draft/overdue transactions.
- [Xero business snapshot](https://central.xero.com/0/article/Business-Snapshot/):
  distinguish unpaid approved invoices from other business measures.
- [NN/g user need statements](https://www.nngroup.com/articles/user-need-statements/):
  organise around the user's decision and desired outcome.

These are design inputs, not evidence that Ledger has Xero's accounting features.
The chosen layout is our application of that guidance to Ledger's available data.

## Workbook import

Source: `Our Service (2).xlsx`. The extracted catalogue is
`src/lib/services/workbook-catalogue.json`: nine sheet categories and 74 distinct
children/packages. HR, Account service and HRIS include the individual services
listed in the workbook as well as packages/plans. Corporate packages preserve
inclusions in their descriptions; recruitment descriptions preserve provisional
percentage fees and visit/replacement terms. The two empty sheets become main
categories with no invented children. Obvious spelling mistakes in service names
are corrected. Tiered pricing and unspecified rates are retained as notes, not
converted into guessed fixed prices.

1. The service hierarchy must be installed. The separate bulk-import RPC is
   optional: the app falls back to the existing `save_record` RPC when PostgREST
   reports it missing (`PGRST202`). To install the atomic bulk path, apply
   `supabase/migrations/20261105094507_workbook_catalogue_import.sql`.
   `supabase/services-upgrade.sql` includes this and the hierarchy prerequisites.
2. Open Services Catalogue, expand **Your workbook**, inspect the hierarchy, then
   click **Import workbook services**. The bulk RPC uses one transaction. The
   fallback uses one existing administrator-checked `save_record` transaction per
   service. The server action independently verifies administrator access.
3. Existing matching names within the same parent/currency keep their prices and
   IDs. Existing services in different categories are not moved. Repeat imports
   reuse matched entries. Deleted/renamed entries may be re-created by a later import.
4. Unpriced children are inactive (archived) with “Price needed”. Edit the service,
   enter its agreed rate, choose Active under Service status, and save. Main categories have a zero
   standalone charge. Known accounting and incorporation package prices are active.

The fallback refreshes existing catalogue records before creating each missing
entry and uses deterministic UUIDv5 IDs. On interruption, completed records stay
saved; retry skips existing records and resumes. Permission errors do not trigger
the fallback. The service list refreshes even when an import stops partway through.

Installing SQL alone does not insert the workbook. Import is an explicit action.
No customer balances, invoice items, or existing agreed packages are modified.
Hosted changes were not applied by this assistant: the connected Supabase account
cannot access the configured project. The full SQL file is provided for its owner.

## Catalogue cleanup requested November 6

The workbook import panel is removed from Services Catalogue now that the workbook
has been imported. The list omits descriptions, puts badges below service names,
and offers Add sub-service in each main service's action menu. Page canvases are
white; menus animate open and closed unless reduced motion is requested.

To apply the requested saved-data cleanup, run
`supabase/maintenance/activate-services-and-clear-descriptions.sql` as postgres
in the configured project's SQL Editor. It activates every service and clears
all saved catalogue descriptions in one transaction. It preserves IDs, names,
prices, currencies, billing frequencies, parent relationships and financial
records. Repeating it is safe. Its integration test checks preservation of an
issued invoice balance and all non-target service fields.

The assistant could not run this against the hosted project because the connected
Supabase account was denied access. Archived badges reflect the saved state until
the script is applied; the UI does not pretend that records have been activated.
