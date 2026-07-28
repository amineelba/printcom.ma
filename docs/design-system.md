# Design system

## Source and adaptation

`docs/design-system-source/APPLE-COM-DESIGN-SYSTEM-TOKENS.md` is a
reverse-engineered structural reference for Apple.com's design system —
supplied as the frontend architecture reference for this project. It is
used **only** for its structural principles (Foundation → Semantic →
Component → Template token layering, spacing/radius/typography scales,
motion curves, breakpoint model, component anatomy). Nothing from it is
copied as-is into a shipped asset:

- No Apple logo, trademark, or copy.
- No SF Pro / SF Symbols files — see "Typography" below.
- No product photography, layout compositions, or campaign artwork.
- No CSS variable names starting with `apple` — every token in this repo
  is prefixed `pc-` / `printcom` (`--pc-color-*`, `--pc-space-*`, etc.).

## Token architecture

```text
src/styles/tokens/
├── foundation.css    Raw scales: color, type size/weight/line-height,
│                     spacing, radius, borders, shadow, opacity, motion,
│                     breakpoints, content widths, z-index
├── semantic.css       Foundation values mapped to roles: text/background/
│                      border/action colors, materials, elevation,
│                      spacing roles, typography roles
├── components.css     Component-scoped dimensions (nav height, button
│                      padding, card radius, field height, modal size...)
├── templates.css       Page-level composition values (hero min-height,
│                        section gaps, reading widths)
└── index.css            Single entry point, imports in order
```

`src/app/(frontend)/globals.css` imports `tokens/index.css`, then maps a
subset of semantic tokens into Tailwind v4's `@theme inline` block so
components can use ordinary utility classes (`bg-canvas`, `text-primary`,
`rounded-card`, `shadow-card`) instead of writing `var(--pc-...)`
everywhere. Anything not in the `@theme` map is still available as a raw
CSS custom property and used via Tailwind's arbitrary-value syntax, e.g.
`bg-(--pc-color-error-subtle)`.

**Rule enforced throughout the component library**: no component reads a
raw hex/px value. Everything traces back to `foundation.css` through
`semantic.css`. `pnpm verify-design-tokens` is a CI gate asserting the
highest-priority tokens still exist by name.

`src/lib/design-system/` provides the TypeScript side: `tokens.ts` (typed
`var(--pc-...)` accessors for contexts that need a JS string, e.g. inline
SVG), `theme.ts` (Tailwind class-string maps for `Button` variants/sizes,
`Card` radius), `types.ts` (shared union types), `responsive.ts`
(breakpoint values duplicated intentionally for JS-side logic, since CSS
custom properties can't be read inside `@media` queries — see the
comment in that file for why the numbers must stay in sync with
`foundation.css`).

## Palette

Neutral scale (`gray-50`…`gray-950`, `white`, `black`) copied verbatim
from the reference doc's reconstructed values — these are generic,
widely-used neutral tones, not Apple-specific IP. The interactive/brand
color is provisional (see `docs/assumptions.md` § Brand color) and
overridable at runtime via the `design-settings` global without a
redeploy.

Functional colors (success/warning/error/info) are the reference doc's
WCAG-checked values, reused for the same reason.

## Typography

`-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial,
sans-serif` — the standards-compliant system-font stack, which resolves
to whatever the visitor's OS already has installed (San Francisco on
Apple devices, Segoe UI on Windows). No font files are downloaded,
converted, or bundled. Type scale, weights, and line-heights mirror the
reference doc's reconstructed values (an 11px→96px size ramp, 400-700
weight range, 1.0-1.47 line-height range) — these are generic type-scale
numbers, not distinctive Apple IP.

Large headings use `clamp()` for fluid responsive sizing (see
`--pc-type-hero-display-size` etc. in `semantic.css`) rather than a fixed
size — required by the brief (§20.5).

## Spacing, radius, motion, breakpoints

Directly adapted from the reference doc's reconstructed scales
(`--pc-space-0` through `--pc-space-40`, `--pc-radius-none` through
`--pc-radius-full`, `--pc-duration-instant` through `--pc-duration-story`,
the three-tier small/medium/large breakpoint model at 734/1068px). These
are generic design-token numbers (a spacing scale, a radius scale, easing
curves) — no Apple-specific composition or layout is reproduced.

Tailwind's default breakpoint scale is fully overridden in `globals.css`
(`--breakpoint-sm/md/lg/xl/2xl`) to match this three-tier model exactly,
so `lg:` in any component means "Large: ≥1069px" per the brief, not
Tailwind's stock 1024px default.

## Component library

`src/components/` is organized by role: `ui/` (Button, Container,
Eyebrow, SectionHeader, CTAGroup, ResponsiveImage), `layout/`
(SiteHeader, SiteFooter), `navigation/` (DesktopNavigation,
MobileNavigation, SearchOverlay, Breadcrumbs, FooterAccordionColumn),
`heroes/` (Hero), `cards/` (one per content type — ProductCard,
CategoryCard, ServiceCard, SolutionCard, SectorCard, TechnologyCard,
MaterialCard, FinishCard, ResourceCard, ProductGrid), `rails/`
(HorizontalRail — native scroll-snap, keyboard-operable prev/next, no
autoplay/infinite loop per the brief), `filters/` (FilterBar, Pagination
— both URL-driven), `forms/` (the full quote wizard stack —
QuoteWizard/QuoteStepper/QuoteSummary/FileUpload/ContactForm/FormField/
ConsentField/FormErrorSummary/inputs), `content/` (RichTextRenderer,
ProcessSteps, FAQAccordion, SpecificationList, QuoteCTA, ContactCTA),
`feedback/` (EmptyState, LoadingState, ErrorState), `seo/`
(StructuredData).

`ProductCard` deliberately never renders price, stock, promotion badges,
ratings, or an "add to cart" affordance — this is a B2B quote catalogue,
not an e-commerce listing (brief §20.14).

## Live reference

`/design-system-preview` renders every token category and the base
component set for visual regression checking. It calls `notFound()` when
`process.env.NODE_ENV === 'production'` — since `next build` always sets
`NODE_ENV=production`, this branch is dead code in the shipped bundle
(verified: the route statically prerenders to a 404 in `pnpm build &&
pnpm start`).

## Accessibility commitments baked into the token/component layer

- Every interactive component keeps `:focus-visible` styling (never
  `outline: none` without a replacement) — see the global focus rule in
  `globals.css`.
- `prefers-reduced-motion: reduce` collapses all transition/animation
  durations to near-zero globally (`globals.css`).
- Touch targets sized to `--pc-touch-target-min` (44px) throughout nav,
  buttons, and form controls.
- Translucent surfaces (nav background) have an explicit opaque
  fallback activated under `prefers-reduced-transparency: reduce`
  (`semantic.css`).
