# Testing

## What actually runs, and what was verified

Every command below was executed against this codebase during
development (not just written and assumed to pass) — the final state is:
`pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test:unit`,
`pnpm test:integration`, and `pnpm test:e2e` all pass with zero errors
(lint has 5 remaining warnings, all in generated/scaffold files —
`src/migrations/*.ts` unused hook args, one unused Playwright fixture
arg — none in application code).

## Unit tests (`tests/unit/`, `pnpm test:unit`, no database)

| File | Covers |
|---|---|
| `buildProductWhere.spec.ts` | The `/produits` filter-query builder — cumulative AND filters, empty-param handling |
| `quoteValidation.spec.ts` | `quoteNeedSchema`, `quoteContactSchema`, `quoteRequestSchema` — rejection of invalid request types, invalid emails, `consentConfirmed: false`, missing idempotency key |
| `generateReference.spec.ts` | `formatReference`'s zero-padding and non-truncation of large sequences |
| `normalize.spec.ts` | Accent-stripping/lowercasing for search |
| `noForbiddenTaxonomy.spec.ts` | Asserts `Products`/`ProductCategories`/`Solutions`/`Sectors`/`Services` never define a forbidden slug (réalisations/projects/portfolio/etc.), and `Products` has no cart-shaped fields |

19 tests, all passing.

## Integration tests (`tests/integration/`, `pnpm test:integration`, requires `DATABASE_URL`)

| File | Covers |
|---|---|
| `api.int.spec.ts` | Payload Local API boots correctly; config never registers a forbidden collection |
| `accessControl.int.spec.ts` | Draft products invisible to anonymous reads; published products visible; `quote-requests`/`private-quote-files` reject anonymous reads outright (see `docs/access-control.md` for why this throws rather than returning empty) |
| `seedIdempotency.int.spec.ts` | `runSeed()` executed twice produces identical document counts (proves the upsert-by-slug logic is actually idempotent, not just "should be"); demo products seed as `draft`; sectors seed with the mandated neutral positioning note |

9 tests, all passing. Run against a real local Postgres in this session
(not mocked) — see `docs/deployment.md` for how migrations are applied
before these run.

## E2E tests (`tests/e2e/`, `pnpm test:e2e`, Playwright + Chromium)

`frontend.e2e.spec.ts` (11 tests): homepage hero content, skip-link
focus order, desktop nav → `/produits`, category filter updates the URL,
mobile menu opens/traps focus/closes on Escape, search overlay →
`/recherche?q=...`, contact form validation summary on empty submit,
quote wizard blocks advancing past step 1 without a description, unknown
routes return an actual 404 status with the styled not-found page,
`/parc-machines` 404s (no confirmed machine seeded), reduced-motion
media query doesn't break rendering.

`admin.e2e.spec.ts` (3 tests): admin login → dashboard, collection list
view, collection create view.

14 tests, all passing.

### A note on what surfaced during actual test execution (not hypothetical)

Two real bugs were caught by running these tests, not by inspection:

1. **Missing root `not-found.tsx`.** A route-group-scoped
   `not-found.tsx` (`src/app/(frontend)/not-found.tsx`) only catches
   explicit `notFound()` calls made from within that group's pages — it
   does **not** catch genuinely unmatched URLs, which instead fell
   through to Next's generic unstyled 404. The e2e test
   `unknown route renders the 404 page` failed against the real dev
   server and exposed this; fixed by adding `src/app/not-found.tsx`
   with its own `<html>/<body>` (required because of the parallel
   root-layout setup — see `docs/architecture.md`).
2. **Schema drift between Payload's dev-mode auto-push and a formal
   migration.** Running integration tests against a freshly-migrated
   database failed with a Postgres error dropping a constraint that
   didn't exist — Payload's Postgres adapter was trying to
   auto-reconcile schema on every boot (`push: true`, the default) on
   top of a database that already had a formal migration applied,
   and the two mechanisms disagreed. Fixed by setting `push: false`
   permanently (see `docs/architecture.md`) and regenerating a clean
   migration.

## What is not covered

- No axe-core/automated accessibility audit is wired into CI — a11y was
  addressed through consistent use of semantic HTML, ARIA attributes on
  custom widgets (accordion, mega-menu, mobile nav dialog, search
  combobox-lite), and manual verification (keyboard navigation, focus
  trapping, skip link), but not machine-verified against WCAG success
  criteria automatically. Adding `@axe-core/playwright` to the e2e suite
  would be the natural next step.
- No visual regression testing beyond the manual `/design-system-preview`
  reference page.
- Email delivery is not integration-tested beyond the `console` fallback
  logging correctly — no test hits the real Resend API.
