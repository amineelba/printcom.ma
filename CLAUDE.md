# CLAUDE.md

Guidance for Claude Code (or any engineer) working in this repository.

## What this is

Printcom.ma — the corporate and commercial website for Printcom, a
Moroccan B2B commercial printing company. Next.js (App Router) with
Payload CMS embedded in the same app, PostgreSQL, French-only content.
Full brief: see the original task description; structural summaries live
in `docs/`.

Primary conversion goal: **structured quote requests** (`/demande-de-devis`),
not e-commerce. There is no cart, no checkout, no online payment, and no
"Réalisations"/portfolio/case-studies section anywhere — these are
permanently out of scope (see `docs/content-model.md`).

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict)
- Payload CMS 3.86, `@payloadcms/db-postgres`, PostgreSQL
- Tailwind CSS v4 (CSS-first `@theme`), custom `pc-` design tokens
- Zod for all form/server-action validation
- Vitest (unit + integration), Playwright (e2e)
- pnpm

## Directory map

```text
src/
├── app/
│   ├── (frontend)/     Public site — one folder per route, Server Components by default
│   ├── (payload)/      Payload admin panel (generated files — do not hand-edit)
│   ├── sitemap.ts, robots.ts, not-found.tsx   Root-level special files
├── collections/        Payload collections (one file per collection)
├── globals/             Payload globals (site-settings, header, footer, homepage, ...)
├── components/          ui/ layout/ navigation/ heroes/ cards/ rails/ filters/ forms/ content/ feedback/ seo/
├── lib/
│   ├── design-system/   Typed accessors for pc- tokens
│   ├── payload/         access.ts (access-control helpers), fields.ts (shared field groups), client.ts
│   ├── validation/      Zod schemas (contact, quote)
│   ├── email/           Pluggable sendEmail (console/resend)
│   ├── security/        honeypot, rate limiting, idempotency
│   ├── seo/              JSON-LD builders
│   ├── catalog/          buildProductWhere (filter query builder)
│   ├── quote/            reference number generation
│   └── seed/             runSeed (idempotent, testable)
├── scripts/              CLI entrypoints: seed.ts, create-admin.ts, verify-content.ts, verify-design-tokens.ts
├── styles/tokens/         foundation.css → semantic.css → components.css → templates.css → index.css
└── proxy.ts               Redirect resolution (Next 16's renamed "middleware")

docs/                     See below — read before making structural changes
tests/
├── unit/                  No DB required
├── integration/           Requires a running Postgres (Local API)
└── e2e/                   Playwright, requires the dev server
```

## Before making changes

1. Read `docs/content-model.md` for what collections/routes exist and why "Réalisations" is banned.
2. Read `docs/design-system.md` before touching any visual code — components must consume `pc-` semantic tokens, never raw hex/px values.
3. Read `docs/access-control.md` before touching any collection's `access` config — `quote-requests`, `contact-requests`, `private-quote-files`, and `newsletter-subscribers` must never become publicly readable.
4. Read `docs/assumptions.md` for what's provisional (notably: no verified Printcom brand color yet — see `DesignSettings` global).

## Commands

```bash
pnpm dev                    # Next dev server (also serves /admin)
pnpm build && pnpm start    # Production build/serve
pnpm typecheck               # tsc --noEmit
pnpm lint                    # eslint
pnpm test:unit                # Vitest, no DB
pnpm test:integration         # Vitest, needs DATABASE_URL reachable
pnpm test:e2e                  # Playwright, starts its own dev server

pnpm payload migrate:create <name>   # After changing any collection/global field
pnpm payload migrate                  # Apply migrations — required before first run
pnpm seed                              # Idempotent — safe to re-run
pnpm create-admin                      # Needs ADMIN_EMAIL/ADMIN_PASSWORD in env
pnpm verify-content                    # CI gate: forbidden slugs, "[À confirmer]" leaks, missing consent flags
pnpm verify-design-tokens              # CI gate: required pc- tokens present
```

## Non-negotiable rules (see the original brief for full detail)

- **No invented facts.** Founding year, employee count, certifications, machine capacities, client names, testimonials — none of these exist in the seed data because none were confirmed. Draft/`unverified` status hides them from the public frontend automatically (`publicReadPublished` access + `verificationStatus` filters). Never flip a document to `published`/`confirmed` without a real source.
- **No `[À confirmer]` on the frontend.** That marker is for the admin UI only — `pnpm verify-content` checks published docs for leaks.
- **No cart/checkout/pricing.** `products.indicativePrice` is admin-only and disabled by default (`indicativePriceEnabled: false`).
- **No "Réalisations"/portfolio collection**, route, nav entry, or seed data, ever.
- **Migrations, not dev-push.** `push: false` in `payload.config.ts` is deliberate — after changing a collection/global's fields, run `payload migrate:create <name>` and commit the generated migration.

## Design system

Four-layer token architecture in `src/styles/tokens/` (`foundation.css` →
`semantic.css` → `components.css` → `templates.css`), all prefixed `pc-`,
adapted from `docs/design-system-source/APPLE-COM-DESIGN-SYSTEM-TOKENS.md`
(a structural reference only — no Apple branding/fonts/assets/copy is
reused anywhere). Tailwind v4's `@theme inline` block in
`src/app/(frontend)/globals.css` maps the semantic tokens to utility
classes (`bg-canvas`, `text-primary`, `rounded-card`, etc.). Full detail:
`docs/design-system.md`. Live reference: `/design-system-preview`
(dev-only, 404s in a production build).
