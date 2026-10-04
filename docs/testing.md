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
| `quoteValidation.spec.ts` | `quoteCheckoutSchema` — required name/phone/email/`designSource`/consent, exact `designSource` enum, optional company/comment (normalized), comment length cap, honeypot passthrough, missing idempotency key |
| `configuratorData.spec.ts` / `configuratorState.spec.ts` / `ProductConfigurator.spec.tsx` | Product configurator: normalizer (omitted groups, order, labels, relationships, images, custom format), state/summary logic, and the rendered component (radio/checkbox semantics, selection, summary, gallery, CTA, no price/cart UI). `.spec.tsx` is picked up via `vitest.config.mts` |
| `configuratorTransport.spec.ts` / `configuratorResolve.spec.ts` | Sprint 4 transport (round trip, determinism, URL safety, fail-closed parsing, URLs) and server-side canonicalization (foreign/stale/unpublished values rejected, custom-format dimensions, legacy slugs, safe count/dimension parsers) |
| `configuratorHydration.spec.tsx` / `analytics.spec.ts` / `QuoteRequestSummary.spec.tsx` | Restored configurator state (inputs, summary, preview, CTA round-trip), event semantics (started once, selected/deselected, completed, StrictMode once-per-view, no PII), provider isolation, "Modifier" link |
| `quoteConfigurationMapping.spec.ts` | Canonical configuration → `quote-requests` fields (no `NaN`, labels kept when not numeric, custom dimensions, square) and the notification/confirmation emails |
| `configuratorSchema.spec.ts` | Sprint 5: three structurally different products (card / document / label) render only their own dimensions in schema order; allowlists differ per product; needs-review / unverified / unpublished / foreign-dimension data never renders; typed dimensions need explicit permission; Sprint 3 overrides survive; legacy fallback; generic resolver (foreign dimension, foreign option, kind mismatch, measures/numbers/texts/flags, technical selections); v1 URLs still resolve |
| `configurator-schema/*.spec.ts` | Sprint 5 tooling: master-content / seed / long-description source parsing, reviewed dimension mapping (ambiguous terms stay separate), backfill planning (legacy values, Sprint 3 metadata, idempotence, manual rows untouched, review queue persistence, no category inheritance, 11 representative products distinct), audit completeness over all 94 products, CSV/JSON export + import validation and diff, local-only write guard |
| `quoteEmails.spec.ts` | Notification/confirmation email rendering (no `undefined`, company only when present, HTML escaping, no promises) and `mapCheckoutToQuoteRequest` normalization |
| `generateReference.spec.ts` | `formatReference`'s zero-padding and non-truncation of large sequences |
| `normalize.spec.ts` | Accent-stripping/lowercasing for search |
| `noForbiddenTaxonomy.spec.ts` | Asserts `Products`/`ProductCategories`/`Solutions`/`Sectors`/`Services` never define a forbidden slug (réalisations/projects/portfolio/etc.), and `Products` has no cart-shaped fields |

248 tests, all passing (run with `--workers=1`).

## Integration tests (`tests/integration/`, `pnpm test:integration`, requires `DATABASE_URL`)

The files share one database and several create/delete catalogue rows, so `pnpm test:integration` runs them one file at a time (`--no-file-parallelism`); running them in parallel makes count-based assertions (seed idempotency) flaky.

| File | Covers |
|---|---|
| `api.int.spec.ts` | Payload Local API boots correctly; config never registers a forbidden collection |
| `accessControl.int.spec.ts` | Draft products invisible to anonymous reads; published products visible; `quote-requests`/`private-quote-files` reject anonymous reads outright (see `docs/access-control.md` for why this throws rather than returning empty) |
| `quoteCheckout.int.spec.ts` | The real `submitQuoteRequest` server action (only `next/headers` mocked) against Postgres: both `designSource` answers persist with normalized values, company/comment optional, published-only product/support/finition context, honeypot writes nothing, same idempotency key → one lead, malformed input rejected server-side, per-IP rate limit, anonymous reads still refused. Cleans up the leads it creates |
| `quoteConfigurationPersistence.int.spec.ts` | Sprint 4: the real action persists the full canonical configuration (relationships, labels, numbers), keeps labels when counts aren't numeric, rejects tampering/malformed/unpublished input, legacy slugs, generic quote, idempotent replay, honeypot, anonymous read still refused. Creates and removes its own catalogue fixtures |
| `configuratorSchema.int.spec.ts` | Sprint 5 against Postgres: dry-run writes nothing; write backfill creates product-specific schemas, shares one catalog option across products, keeps materials/finishes/Sprint 3 media; second run is a no-op; schema configurator = legacy configurator value for value; v1 and v2 URLs submit; tampered specialized selections are rejected; specialized selections are snapshotted on the quote; import `--write` is additive and idempotent; bad rows write nothing; drafts never leak |
| `productOptionMedia.int.spec.ts` | Image-capable product option rows: legacy label-only rows stay valid, `image`/`previewImage` persist distinctly on formats/grammages, description length validation, materials/finishes stay shared (no `previewImage`), public read exposes no price |
| `seedIdempotency.int.spec.ts` | `runSeed()` executed twice produces identical document counts (proves the upsert-by-slug logic is actually idempotent, not just "should be"); demo products seed as `draft`; sectors seed with the mandated neutral positioning note |

65 tests, all passing. Run against a real local Postgres in this session
(not mocked) — see `docs/deployment.md` for how migrations are applied
before these run.

## E2E tests (`tests/e2e/`, `pnpm test:e2e`, Playwright + Chromium)

`frontend.e2e.spec.ts` (11 tests): homepage hero content, skip-link
focus order, desktop nav → `/produits`, category filter updates the URL,
mobile menu opens/traps focus/closes on Escape, search overlay →
`/recherche?q=...`, contact form validation summary on empty submit, unknown
routes return an actual 404 status with the styled not-found page,
`/parc-machines` 404s (no confirmed machine seeded), reduced-motion
media query doesn't break rendering.

`quoteCheckout.e2e.spec.ts` (4 tests): `/demande-de-devis` is a single-scroll form (no stepper/next-back/file upload/brief), required errors are tied to their fields and focus the first one, `designSource` is a mutually exclusive keyboard-operable radio group, and the short form submits through to `/demande-de-devis/merci?reference=PC-DEVIS-…`.

`productConfigurator.e2e.spec.ts` (9 tests, creates its own published fixtures incl. generated flat-colour PNGs): configure → summary → quote link, keyboard radios/checkboxes, custom format, no price/cart UI, product without configuration, category archive unaffected, mobile no-overflow; plus a visual-options flow (thumbnails, main preview following `previewImage`, text-only options, mobile image cards).

`quoteConfigurationFunnel.e2e.spec.ts` (13 tests): configure → server-rendered "Votre demande" → "Modifier" → restored product → edit → submit → the persisted lead; product-only and generic quotes; legacy `support`/`finition` links; tampered, stale, malformed and unknown-product links; custom-format round trip; analytics sequence (once-per-view, nothing on category archives or failed validation, no PII); mobile. Each test sends its own `x-forwarded-for` so the 3/min/IP limiter of the shared dev server isn't tripped.

`productSpecificSchema.e2e.spec.ts` (9 tests): three schema-defined products (card / document / label, plus a needs-review dimension that must not render) show only their own dimensions; select → preview override → checkout summary in schema order → Modifier restores → submit → persisted core fields; typed measure / number / boolean round-trip and are snapshotted on the lead; the document product ignores the card's and label's dimensions in a forged URL; Sprint 4 (v1) URLs still work and « Modifier » emits v2; unknown versions are ignored; mobile.

`admin.e2e.spec.ts` (3 tests): admin login → dashboard, collection list
view, collection create view.

48 tests, all passing (run with `--workers=1`).

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
