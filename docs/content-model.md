# Content model

## Collections (22)

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

## Globals (9)

`site-settings`, `header`, `footer`, `homepage`, `contact-settings`,
`quote-settings`, `seo-defaults`, `social-links`, `design-settings` —
all in `src/globals/`. All are publicly readable (they're configuration,
not data) except writes, which require `admin` or `content-manager`.

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
