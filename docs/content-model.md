# Content model

## Collections (26)

| Collection | Purpose | Public read? |
|---|---|---|
| `users` | Admin accounts (roles: admin, content-manager, sales-manager, sales-agent) | No |
| `media` | Public images (5 generated sizes) | Yes |
| `private-quote-files` | Files attached to quote requests | **Never** |
| `product-categories` | Two-level product taxonomy (§12) | Published only |
| `products` | Catalogue (§19 field groups) | Published only |
| `services` | Services and sub-services (§13) | Published only |
| `solutions` | Solutions "par besoin" (§14) | Published only |
| `sectors` | Solutions "par secteur" (§15) | Published only |
| `technologies` | Print technologies (§16) | Published **and** `verificationStatus: confirmed` |
| `materials` | Supports/materials (§17), grouped | Published only |
| `finishes` | Finishes (§18), grouped, structured relations | Published only |
| `resources` | Editorial guides/articles | Published only |
| `faqs` | FAQ entries, categorized | Published only |
| `testimonials` | Client quotes — requires `consentConfirmed` | Published only |
| `clients` | Client names/logos — requires `authorizationConfirmed` | Published only |
| `production-sites` | Printcom sites | Published only |
| `machines` | Machine park | Published **and** `verificationStatus: confirmed` |
| `quote-requests` | Structured quote submissions | **Never** (sales team only) |
| `contact-requests` | General contact submissions | **Never** (sales team only) |
| `newsletter-subscribers` | Newsletter opt-ins | **Never** (admin/content-manager only) |
| `legal-documents` | Mentions légales, confidentialité, cookies | Published only |
| `redirects` | 301/302 redirect table | Yes (read-only, consumed by `src/proxy.ts`) |
| `invoices` | Staff-generated client invoices with PDF export (`payload-invoicepdf` plugin) | **Never** (sales team only) |
| `quotes` | Staff-generated priced quotes with PDF export (`payload-invoicepdf` plugin) — distinct from the public `quote-requests` intake form | **Never** (sales team only) |
| `imports` | Bulk CSV/JSON import jobs (`@payloadcms/plugin-import-export`) | **Never** (admin/content-manager only) |
| `exports` | Generated bulk CSV/JSON export files (`@payloadcms/plugin-import-export`) | **Never** (admin/content-manager only) |

## Globals (10)

`site-settings`, `header`, `footer`, `homepage`, `contact-settings`,
`quote-settings`, `seo-defaults`, `social-links`, `design-settings` —
all in `src/globals/`. All are publicly readable (they're configuration,
not data) except writes, which require `admin` or `content-manager`.

`shop-info` (from `payload-invoicepdf`) is the exception: it holds the
company's bank/IBAN and legal details used on generated invoice PDFs, so
it's sales-team/admin only, not publicly readable — see
`docs/access-control.md`.

## Invoicing (payload-invoicepdf plugin)

`src/payload.config.ts` registers the third-party `payload-invoicepdf`
plugin, which adds `invoices`, `quotes` (collections, admin group
"Invoicing") and `shop-info` (global). This is an **internal back-office
tool** for the sales team to produce real, priced PDF invoices/quotes for
a client after a `quote-requests` submission has been studied and a deal
is ready to be formalized — it does not add a cart, checkout, or any
public-facing pricing (see CLAUDE.md's non-negotiable rules). Nothing it
generates is exposed on the public frontend.

`productFieldMapping.price` points at `products.indicativePrice` — the
existing admin-only field that stays empty/unused unless a human
deliberately fills it in per product. The plugin's product-autofill
convenience feature will only ever pull a price a staff member actually
entered; nothing is invented or auto-computed.

The plugin ships its collections/global with no `access` config of its
own (see `docs/access-control.md` for how that's patched).

## Bulk import/export (@payloadcms/plugin-import-export)

`src/payload.config.ts` also registers the official
`@payloadcms/plugin-import-export`, scoped via `importExportSlugs` to
structural/catalogue collections only (media, products, services,
solutions, sectors, technologies, materials, finishes, resources, faqs,
testimonials, clients, machines, redirects) — deliberately excludes
quote-requests, contact-requests, newsletter-subscribers,
private-quote-files and users, so bulk CSV/JSON tooling never touches
PII or commercial data. Adds an "Export"/"Import" action to each scoped
collection's list view (via the kebab menu) plus `imports`/`exports`
collections and `payload_jobs`/`payload_jobs_log` tables to run the work
asynchronously through Payload's Jobs Queue. Same access-control gap as
the invoicing plugin above — see `docs/access-control.md`.

## Quote request PDF export

Separate from the invoicing plugin above: `quote-requests` documents
(the public form submissions) can be downloaded as a formatted PDF
directly from the admin — a "Télécharger en PDF" button in the document
sidebar (`src/components/admin/DownloadQuoteRequestPdfButton.tsx`) hits a
custom collection endpoint, `GET /api/quote-requests/:id/pdf`
(`src/lib/pdf/quoteRequestPdfEndpoint.ts`), which renders every field of
the request (besoin, configuration, production/livraison, fichiers,
contact, suivi commercial) via a `@react-pdf/renderer` template
(`src/components/admin/pdf/QuoteRequestPdfDocument.tsx`) and streams the
PDF back. This is a plain export of the structured intake data — not a
priced document — so it's unrelated to `payload-invoicepdf`'s
`invoices`/`quotes` collections; a real priced quote/invoice still goes
through that plugin once a human has worked out numbers.

The endpoint reuses `quote-requests`' own `access.read`
(`salesRecordAccess`) via `overrideAccess: false` instead of a bespoke
role check, so a sales-agent can only export requests assigned to them —
same rule as viewing the document in admin, enforced in one place. Never
reachable by an anonymous caller (`tests/integration/accessControl.int.spec.ts`
doesn't cover this endpoint directly since it's a Next.js route rather
than a `payload.find`, but the underlying access function is the same one
already tested there).

## Editorial workflow (shared across content collections)

`src/lib/payload/fields.ts` exports `workflowFields`, applied to every
public content collection:

```text
draft → review → approved → published → archived
```

Plus `owner`, `reviewer`, `reviewNotes` (internal-only), `publishedAt`,
`archivedAt`. Only `status: published` is ever visible to anonymous
visitors (enforced both by `publicReadPublished` access control and by
explicit `where` filters in every frontend query — see
`docs/architecture.md`).

## Business-fact verification (separate from editorial status)

`verificationField` (also in `src/lib/payload/fields.ts`) adds
`verificationStatus: unverified | confirmed | unavailable` to
`technologies`, `machines`, `testimonials`, `clients`, `production-sites`
— anything that states a factual industrial/commercial capability. A
document can be `status: published` and still `verificationStatus:
unverified`; the frontend requires **both** conditions before rendering
technologies/machines. This is how `/parc-machines` and `/technologies`
stay empty/hidden until Printcom actually confirms the underlying fact
(see `docs/content-to-confirm.md`).

## What is permanently out of scope

Per the brief (§4), the following must never exist in this codebase, in
any form — no collection, route, nav entry, seed data, or component:

- `realisations` / `réalisations` / `projects` / `portfolio` /
  `case-studies` / `work` collection or taxonomy
- Cart, checkout, online payment
- Automatic/final pricing (`products.indicativePrice` exists but is
  admin-only, disabled by default, and never rendered publicly)
- Customer accounts, order tracking, marketplace features

`pnpm verify-content` and `tests/unit/noForbiddenTaxonomy.spec.ts` both
guard against the collection-slug half of this; there is no automated
guard against someone manually adding a "Nos réalisations" page — code
review is the guard there.

## Product field groups (§19)

`src/collections/Products.ts` mirrors the brief's five groups exactly:
Identité, Classification, Configuration, Production, Préparation des
fichiers, Commercial (as a `collapsible` in the admin UI), plus SEO and
the shared workflow fields. `quoteOnly: true` and
`indicativePriceEnabled: false` are the defaults for every new product —
an editor has to deliberately opt in to showing any price, and even then
only `indicativePrice` (admin-only field) is available, never a
transactional price.
