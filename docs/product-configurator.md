# Product configurator

Since Sprint 2, **the product page owns configuration** and the quote page
owns contact capture:

```text
/produits/<slug>  →  configure what you want printed
        ↓  "Obtenir mon devis"
/demande-de-devis?produit=<slug>  →  short checkout (who you are, who provides the design)
```

Configuration is a quote *request* aid, not e-commerce: the configurator
never shows a price, stock, availability, delivery promise or cart, and
nothing about the choices is priced or checked for feasibility.

## Architecture

```text
Payload Product (depth 2)
   ↓  src/lib/configurator/buildProductConfiguratorData.ts   (server, pure)
ProductConfiguratorData   (plain JSON: product identity, media, groups)
   ↓  props
ProductConfigurator       (client; src/components/configurator/)
   ↓
ConfiguratorGroup → ConfiguratorOption   ProductPreview   ConfiguratorSummary
```

- `src/app/(frontend)/produits/[slug]/page.tsx` stays a Server Component.
  It fetches the product, calls the normalizer and renders
  `<ProductConfigurator data intro>`. `intro` (category, H1, short
  description) is server-rendered content slotted into the layout, so the
  page's core copy and metadata/JSON-LD stay in the server tree. Category
  archives (same route) never mount the configurator.
- `buildProductConfiguratorData` is the only code that knows Payload field
  names. It trims media to `{id,url,alt,width,height,sizes}`, resolves
  relationships, drops unresolved/blank/duplicate entries and omits empty
  groups. React components only see `ProductConfiguratorData`
  (`src/lib/configurator/types.ts`).
- `src/lib/configurator/state.ts` holds the pure state logic (initial
  state, selection, summary, quote link) so it is unit-testable without a
  DOM. The client keeps **one** typed `ProductConfigurationState` object
  (`single` selections by group key, `multiple.finish`, `customFormat`) —
  option machine values, not labels — shaped so a later sprint can hand it
  to the quote checkout without restructuring.
- `labels.ts` holds the French titles and the enum label maps; a unit test
  asserts they match the option labels declared in
  `src/collections/Products.ts`.

## Supported CMS fields

Rendered, in this order, only when the product has values:

| Group | Source (`products`) | Selection | Option value |
|---|---|---|---|
| Format | `availableFormats[].label` (+ "Sur mesure" if `customFormatAvailable`) | single | the CMS label |
| Orientation | `orientations` | single | enum value (label Portrait/Paysage/Carré) |
| Nombre de pages | `pageCountOptions[].label` | single | the CMS label |
| Impression | `printSides` | single | enum value (Recto/Recto-verso) |
| Couleur | `colorModes` | single | enum value (Quadrichromie (CMJN)/Noir et blanc/Pantone) |
| Support | `materials` (relationship) | single | material slug, title as label |
| Grammage | `grammages[].label` | single | the CMS label |
| Finition | `finishes` (relationship) | **multiple** | finish slug, title as label |
| Quantité | `quantities[].label` | single | the CMS label |

Labels from label-only arrays are never parsed or reinterpreted.
Relationship options are limited to **published** documents (a populated
relationship does not re-check access control). Option order is the CMS
order; nothing is ranked or marked "popular/recommended".

## Selection semantics

- Product fields are treated as *available choices*.
- Single-choice groups render radios; choosing replaces the previous
  choice. Finishes render checkboxes: the quote model has always stored a
  list of finishes (`quote-requests.configuration.finish` is `hasMany`),
  whereas the product's `hasMany` only lists what is *available*.
- **Singleton auto-selection:** a group with exactly one valid option
  starts selected. Groups with several options start empty — no silent
  preference.
- No group is required: the CTA is never blocked and the summary shows only
  what was chosen. There are no validation errors.
- **Custom format:** when `customFormatAvailable` is set, "Sur mesure"
  joins the Format group (mutually exclusive with the standard formats) and
  reveals Largeur / Hauteur / Unité (mm|cm) inputs with
  `inputMode="decimal"`. No dimension limits are enforced and the helper
  says feasibility is confirmed by Printcom.

## Images

- **Preview:** `primaryImage` first, then `gallery`, de-duplicated.
  Thumbnails (buttons with `aria-pressed`, check badge on the active one)
  appear only when there is more than one image and switch the large
  preview. No image → neutral empty frame, never a broken image.
- **Option cards:** materials and finishes show their existing `image`
  when the CMS has one; otherwise a plain text card. Option images do **not**
  change the main preview.
- `ConfiguratorOption.previewImage` exists in the types as a seam for
  option-specific previews; nothing populates or reads it yet.
- Alt text comes from the media's `alt` only; nothing is invented.

## Layout and accessibility

Desktop: two columns (preview sticky below the two header bars, intro +
groups + summary + CTA on the right). Mobile: one column in the order
intro → preview → thumbnails → groups → summary → CTA. Groups are
`fieldset`/`legend`; options are native inputs (visually hidden, focusable)
inside labels, so arrow keys / Space work natively; selected state =
indicator + border + background + weight, never colour alone; focus uses
the design-system focus tokens. The summary is an `aria-live="polite"`
region. Everything uses `pc-` semantic tokens; motion is limited to short
colour transitions and respects `prefers-reduced-motion`.

## What it deliberately does not do (yet)

- **No state hand-off.** "Obtenir mon devis" links to
  `/demande-de-devis?produit=<slug>` only; selections are local React state
  (no URL serialization, no storage). The quote page does not show or ask
  for configuration. Full hand-off is Sprint 4.
- **Not every option type has imagery.** Only materials and finishes carry
  an `image` in the CMS today; formats, orientations, grammages, quantities
  etc. are text-only. Adding option imagery is Sprint 3 (schema work).
- **Specialized product-family dimensions are not modelled** (packaging,
  labels, roll-ups, signage…). The generic `Products` model only describes
  the groups above; the engine renders what the CMS provides and degrades
  to just the preview + CTA for products with none (which is every seeded
  product today).
- **No dependencies between options** (e.g. finish X only on material Y):
  the CMS does not encode them, so none are invented.
- No pricing, cart, payment, availability or lead-time logic.

## Tests

`tests/unit/configuratorData.spec.ts` (normalizer),
`configuratorState.spec.ts` (state/summary/link),
`ProductConfigurator.spec.tsx` (rendered semantics and interaction),
`tests/e2e/productConfigurator.e2e.spec.ts` (journey through to the quote
page, keyboard, custom format, no-config product, category archive, mobile
overflow). The seed publishes no products and gives none any configuration,
so the e2e suite creates and removes its own fixtures
(`tests/helpers/configuratorFixture.ts`).
