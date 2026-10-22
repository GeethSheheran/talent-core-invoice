# Project conventions

Use npm and pinned versions. Keep secrets server-only. Verify administrators independently in actions and HTTP operations. Financial mutations must use transactional RPCs; never update balances from browser arithmetic. Money is integer minor units (2 decimal currencies in v1), bounded below JavaScript safe integer limits. All SQL changes require authorization and accounting tests. No production fixture data.

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:integration`, `npm run test:browser`, `npm run build`, `npm run pdf:smoke`.
