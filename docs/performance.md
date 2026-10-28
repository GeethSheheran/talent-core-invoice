# Page and component performance

## Findings and fixes (2026-10-28)

- Popup reads used Server Actions, which share a client mutation queue. Company
  editors/records and notification previews now use private, uncached GET routes.
  Each route verifies administrator access before invoking its server-only loader.
  Financial mutations remain transactional Server Actions/RPCs.
- Popup loaders verified access repeatedly through nested repository helpers.
  They now reuse the database client from the one independent authorization check
  at their request boundary. Page rendering retains request-scoped React caching;
  nothing is cached across users or requests.
- Invoice items, delivery attempts, files, agreement versions, project billing,
  pending expenses, and company balances now filter in database queries instead of
  fetching unrelated records. Independent popup reads run in parallel. Pagination
  still retrieves all matching rows beyond the 1,000-row API page size.
- List pages select only the displayed/searchable fields. They no longer fetch
  invoice/payment snapshots or proposal briefs and sections just to display a row.
  List filtering and payment summary calculations still cover the complete list.
- New/edit forms fetch only relevant company, project, and service options.
  Schema readiness checks fetch one row instead of loading a company's history.
- Dashboard notifications stream separately so billing figures do not wait for
  notification context lookups. The notification panel keeps existing items
  visible while refreshing.
- Dismissing a record no longer refreshes the page. Successful Server Actions
  already revalidate the UI; the popup fetches its updated record without issuing
  another redundant router refresh.

## Measurements and limits

Public, unauthenticated probes from this machine (milliseconds, first byte):

| Endpoint | First request | Subsequent requests |
| --- | ---: | ---: |
| Development `/login` | 2170 | 49, 25 |
| Production `/login` | 256 | 10, 11 |
| Supabase Auth settings | 597 | 205, 203 |

These probes identify development startup/compilation and external-request cost;
**they do not measure logged-in billing pages or prove an end-to-end speedup**.
The connector cannot access configured project `vhqtksslpdencpczfhgk`, so database
query plans, indexes, and authenticated before/after timings remain unverified.
No live SQL, indexes, accounting data, or auth policies were changed.

For realistic local performance use a built production server rather than dev:

```sh
npm run build
npm run start -- --port 3109
```

Open `http://localhost:3109`. Keep the normal development server on port 3000 for
editing. Use the Node.js version required by package.json. Do not rebuild the
same output directory while the production server is serving requests.

Verification includes independently authorized HTTP reads, uncached parallel
client requests, scoped multi-page queries, list projections, no page refresh on
popup dismissal, and the existing accounting, browser, build, and PDF checks.
