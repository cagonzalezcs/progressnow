#!/usr/bin/env node
/* Superseded: routes render per request (design D11), so there is no prerendered
 * shell HTML to read. The budget is asserted against the running production
 * server by test/e2e/budget.spec.ts (`npm run test:e2e`). */
console.log(
  "bundle budget: run `npm run test:e2e` — the check lives in test/e2e/budget.spec.ts (see budget.json).",
);
