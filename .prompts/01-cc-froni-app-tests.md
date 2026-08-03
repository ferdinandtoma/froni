<task>
Make froni-app typecheck clean and give the Edition One pool real tests. The app is the standard Shopify React Router template plus three committed, untested files: app/services/edition-pool.server.ts (shared 200 pool, paid count), app/routes/webhooks.orders.paid.tsx, app/routes/jobs.close.tsx.

1. Install dependencies in froni-app (npm install; the lockfile is npm's).
2. Make typecheck pass for the whole app, including the three files. Fix type errors only; do not change runtime behavior. If a template file fails typecheck out of the box, note it in the report rather than refactoring it.
3. Add unit tests with vitest (add as devDependency, config minimal) covering, with admin.graphql mocked:
   - unitsOrdered: sums quantities only for the edition product id, skips cancelled orders, follows pagination cursors, and the orders query filters financial_status:paid.
   - syncPool: remaining = cap minus ordered, clamped at zero; writes the same available quantity to every variant at every location; throws without EDITION_PRODUCT_ID; surfaces inventorySetQuantities userErrors.
   - closeWindow: writes zero to every variant.
   - webhooks.orders.paid action: returns 200 and does nothing for non ORDERS_PAID topics or missing admin; ignores orders whose line items do not contain the edition product; never throws when syncPool rejects (logs and still 200s).
   - jobs.close action: 503 without CLOSE_JOB_TOKEN or SHOP_DOMAIN; 405 on GET; 401 on bad token; calls closeWindow on the happy path.
   Use env stubs per test (EDITION_PRODUCT_ID gid://shopify/Product/16026172850558, EDITION_CAP 200).
</task>

<constraints>
Touch only froni-app/**. Do not run git commands, do not commit, do not push, do not deploy, no network beyond the npm registry. Do not change the behavior of the three files; if a test reveals a real bug, fix the minimal thing and flag it prominently in the report. Do not touch prisma migrations or the template's auth flow.
</constraints>

<verify>
Run and paste real output, not claims:
1. npm run typecheck (or npx tsc --noEmit if no script) inside froni-app.
2. npx vitest run inside froni-app, all tests green.
Iterate until both are green, max 5 iterations. If not green after 5, stop and report the residue; do not weaken assertions to pass. Finish with git status --short so the changed file list is visible; leave everything uncommitted.
</verify>
