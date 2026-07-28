# Assumptions and documented decisions

This project was built with no access to Printcom's actual brand assets,
existing website, internal documents, or staff. Every item below is a
decision made in the absence of that information, following the brief's
priority order (§2: explicit instructions > official Printcom resources >
supplied design system > taxonomy in the brief > reasonable documented
technical decisions).

## Brand color

**No verified Printcom brand color was available.** Per §20.3 of the
brief, the temporary fallback is the same action blue used in the
reference design system (`#0071E3` / `--pc-color-brand-600`). This is
**not** presented as Printcom's brand color anywhere in the UI — it is
simply the interactive-action color, same role Apple.com's site uses it
for (links, primary buttons, focus rings).

`src/globals/DesignSettings.ts` exists specifically so this can be
corrected without a code deploy: once Printcom confirms an official
color, an admin sets `brandColorConfirmed: true` and `brandColorHex` in
that global, and the root layout (`src/app/(frontend)/layout.tsx`) emits
an inline `<style>` override for `--pc-color-brand-500/600/650/700`
(hover/active/link shades derived from the single confirmed hex via
`color-mix()`) — no deploy required, takes effect on the next request.

## Logo

No logo file was supplied. `SiteSettings.logo`/`logoMark` are upload
fields, currently empty; `SiteHeader.tsx` falls back to the site name as
text. No logo was fabricated or approximated.

## Typography

No SF Pro (or other proprietary Apple font) files are bundled or
referenced, per the brief and per the source design system's own
licensing rules. `--pc-font-family-*` uses the standard
`-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
sans-serif` system-font stack, which resolves to San Francisco on Apple
devices, Segoe UI on Windows, and Roboto/similar elsewhere — legitimately
free to use since it never ships a font file.

## Single language (no Payload localization)

The brief's routes, taxonomy, and all seed content are French-only, with
no bilingual requirement stated anywhere. Payload's `localization` config
was deliberately **not** enabled — using it for a single locale only adds
complexity (every query needs a `locale` param, every field gets a locale
suffix in the DB) with no benefit. If Printcom later needs Arabic/English
versions, `localization: { locales: ['fr', 'ar'], defaultLocale: 'fr' }`
can be added to `payload.config.ts`; this is a schema-affecting change
requiring a migration.

## No dark theme on the public site

The reference design system documents both light and dark themes (it's
reconstructing Apple.com, which ships both). Printcom's brief does not
ask for a dark mode, and B2B print-buyer audiences skew toward
utilitarian daylight browsing. The public frontend commits to a single
light, paper-toned surface — matching the brief's "neutral foundation"
principle without duplicating the entire semantic color layer for no
requested benefit. The Payload **admin panel** still follows the
operator's OS theme (that's Payload's own default behavior, unrelated to
this app's token system).

## Directory layout: `src/` instead of a flat root

Section 33 of the brief shows `app/`, `collections/`, `components/`,
`lib/`, `scripts/`, `tests/` at the repository root. This project instead
nests everything except `tests/` and `docs/` under `src/`, matching the
Payload "blank" template this project was scaffolded from and Next.js's
own `src/` convention. Content and intent match the brief exactly; only
the path prefix differs (documented here per §5's "reasonable documented
technical decisions" allowance).

## Reference number generation strategy

`src/lib/quote/generateReference.ts` generates `PC-DEVIS-YYYY-000001` by
counting existing references for the year rather than using a database
sequence. Under concurrent submissions in the same instant this can
collide; `submitQuoteRequest` (in
`src/app/(frontend)/demande-de-devis/actions.ts`) retries up to 5 times
on a unique-constraint violation. At Printcom's expected quote volume
this is more than sufficient; a dedicated Postgres sequence would be a
reasonable follow-up if volume ever grows enough to matter.

## Rate limiting and idempotency are in-memory

`src/lib/security/rateLimit.ts` and `src/lib/security/idempotency.ts`
keep their state in a process-local `Map`. This is correct for a single
long-lived Node process but is **not durable across multiple concurrent
serverless instances** (e.g. several parallel Vercel function
invocations). Documented in `docs/security.md` as a known limitation with
a concrete upgrade path (Vercel KV/Redis) if Printcom's deployment target
runs multiple instances under load.

## Email provider defaults to console logging

No email provider credentials exist yet. `EMAIL_PROVIDER=console` (the
default) logs outbound emails to the server console instead of sending
them, so quote/contact submissions are never silently lost during setup —
but also never actually delivered until `EMAIL_PROVIDER=resend` (or
another supported provider) and its credentials are configured. See
`docs/environment-variables.md`.

## `/parc-machines` and `/qualite-et-engagements`

Per the brief, `/parc-machines` must stay hidden until a confirmed
machine exists; it does (`notFound()` when the `machines` query is
empty — see `src/app/(frontend)/parc-machines/page.tsx`). No machines
were seeded as confirmed, so this route currently 404s, which is correct
launch-day behavior, not a bug.

`/qualite-et-engagements` states plainly that no certification is shown
until confirmed, rather than fabricating ISO/quality claims.

## Sectors, testimonials, clients

All 15 sectors from §15 are seeded as `status: draft` with the exact
neutral formulation the brief specifies ("Printcom étudie les
contraintes d'impression propres à ce secteur."). No client names,
logos, or testimonials were fabricated — `Testimonials` and `Clients`
collections exist and are ready to receive real, consented content, but
contain none.
