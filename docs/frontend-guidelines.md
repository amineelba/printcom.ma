# Frontend guidelines

Practical conventions for adding to the frontend. See `docs/design-system.md`
for the token architecture these rules assume.

## Server vs. Client Components

Default to a Server Component. Add `'use client'` only when the
component genuinely needs browser APIs, event handlers, or React state —
navigation disclosure, overlays, forms, the filter bar, rails with
prev/next controls. A page component that fetches data should stay a
Server Component even if it renders client children; pass fetched data
down as props rather than fetching inside a client component.

## Data fetching

```ts
import { getPayload } from '@/lib/payload/client'

const payload = await getPayload()
const result = await payload.find({
  collection: 'products',
  where: { status: { equals: 'published' } },   // always explicit, even though access control also enforces this
  depth: 1,                                        // only as deep as the page actually needs — avoid N+1-shaped over-fetching
  limit: 12,
})
```

- Always filter `status: { equals: 'published' }` explicitly (see
  `docs/architecture.md` for why this matters even with access control in
  place).
- For `technologies`/`machines`, also filter
  `verificationStatus: { equals: 'confirmed' }`.
- Keep `depth` as low as the page needs. `depth: 0` for id/slug-only
  lookups, `depth: 1` for one level of populated relationships, `depth: 2`
  only when a detail page genuinely needs two hops (e.g. a product's
  related services' images).
- Use `payload.find({ ..., limit: 0 })` to get just a count
  (`totalDocs`) without fetching documents — used in `runSeed`/
  `verify-content` idempotency checks.

## Adding a new route

1. Create `src/app/(frontend)/<route>/page.tsx`. Export `metadata` (or
   `generateMetadata` for dynamic routes) — every page needs a title.
2. Start with `<Breadcrumbs items={[...]} />` under a `<Container>` for
   any page that isn't the homepage.
3. Reuse existing cards/components before writing new ones — check
   `src/components/cards/` and `src/components/content/` first.
3. If the route is CMS-driven and has no dynamic segments, it will be
   statically rendered with the 5-minute ISR default from
   `src/app/(frontend)/layout.tsx` — no extra config needed. If it reads
   `searchParams`, it's automatically per-request.
4. Add the route to `STATIC_ROUTES` in `src/app/sitemap.ts` if it's a
   fixed top-level page (dynamic detail pages are already covered by the
   `dynamicSections` loop there).

## Styling rules

- Never write a raw hex color, unitless magic number for spacing, or
  arbitrary border-radius. Use a Tailwind utility mapped from
  `@theme inline` (`bg-canvas`, `rounded-card`) or a direct CSS-variable
  reference (`bg-(--pc-color-error-subtle)`, `h-[var(--pc-control-md)]`).
- Section spacing: `py-[var(--pc-space-section-small)]` for most content
  sections, `py-[var(--pc-space-section)]` for the homepage's larger
  sections. Don't invent new spacing values.
- Card radius: `rounded-card` (28px) for standard cards, `rounded-card-large`
  for hero-scale cards, `rounded-card-small` for compact list items.
  Never a bespoke radius value.
- Alternate `bg-canvas`/`bg-alternate` between stacked sections rather
  than using shadows to separate them — matches the brief's "precision
  over decoration" principle.

## Forms

- Every form needs: a honeypot field (see `ContactForm.tsx` for the
  pattern), server-side Zod validation (never trust client-side checks
  alone — `submitQuoteRequest`/`submitContactForm` both re-validate),
  and a real `<ConsentField>` wired to actual component state (not
  defaulted to `true` — this was a real bug caught and fixed during
  development of the quote wizard, see git history).
- Use `FormField` + `TextInput`/`TextArea`/`Select` from
  `src/components/forms/inputs.tsx` for every field — they carry the
  shared focus/error/disabled styling and `aria-invalid` wiring.
- Server actions that mutate data should call
  `payload.create(..., { overrideAccess: true })` explicitly — this is
  intentional (the public form has no session/user, so relying on
  access control here would just fail), but it means **the server
  action itself is the security boundary**, not the collection's
  `access.create`. Validate everything before calling `create`.

## Images

Always go through `ResponsiveImage` (`src/components/ui/ResponsiveImage.tsx`),
which wraps `next/image` and reads Payload's media shape (`url`, `alt`,
`width`, `height`). Pass `sizes` matching the actual rendered width at
each breakpoint — don't default to `100vw` for a card that's never full
width.

## Rich text

Route Lexical `richText` field values through `RichTextRenderer`
(`src/components/content/RichTextRenderer.tsx`), never render raw JSON
or attempt a custom serializer.

## Testing a new page

- `pnpm typecheck && pnpm lint` before considering anything done.
- If it added a query pattern worth unit-testing in isolation
  (filter-building logic, formatting), add a test under `tests/unit/`.
- If it's a new golden-path user journey, add a Playwright test under
  `tests/e2e/frontend.e2e.spec.ts` following the existing pattern
  (relative `page.goto('/...')`, since `baseURL` is configured).
