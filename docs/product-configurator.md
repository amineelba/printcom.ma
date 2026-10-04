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

## Images: thumbnail vs preview

Two different jobs, two different fields (Sprint 3):

| Field | Meaning | Where it shows |
|---|---|---|
| `image` — « Image de l’option » | selector **thumbnail** (paper close-up, format silhouette, finish texture…) | inside the option's card |
| `previewImage` — « Image d’aperçu produit » | **main product preview override** while the option is selected | the large preview on the left |
| `description` — « Description courte » (≤ 120 chars) | optional helper text (e.g. « 210 × 297 mm ») | under the option title |

All four combinations work: thumbnail only, preview only, both, neither. A
text-only configurator is still a valid, fully working state; nothing
requires an image to publish. Descriptions render only when populated.

### Which groups are image-capable

- **Inline option lists on `products`** — `availableFormats`, `pageCountOptions`,
  `grammages`, `quantities` — rows are now `{ label, description?, image?,
  previewImage? }` (one shared field set, `visualOptionFields` in
  `src/lib/payload/fields.ts`; migration
  `…_add_visual_metadata_to_product_options`, additive nullable columns only —
  existing rows are untouched and read back with the new fields `null`).
  `label` keeps its requiredness; the row `id` stays the option identity and
  the label stays the selection value (images are metadata, never identity —
  no URL or media id is ever a value). No `value`/`recommended` field was
  added: row ids already give stable identity and nothing in the product
  needs editor-authored recommendations.
- **Shared collections** — `materials` and `finishes` keep their existing
  normalized records and their existing `image`, used as the selector
  thumbnail. They deliberately have **no** `previewImage`: a shared
  record's image cannot be correct for every product (« Soft Touch on a
  business card » ≠ « Soft Touch on a brochure »), so material/finish
  selection does not drive the main preview. Product-specific material/finish
  previews would need a product-level override model and are a known
  limitation, not implemented.
- **Enum groups** (`orientations`, `printSides`, `colorModes`) keep their
  enum storage and stay text options, except orientation which shows a tiny
  generic sheet outline (CSS, semantic tokens — a UI cue, not product
  photography). No CMS imagery for enums.

### How options render (inferred from data, never an editor choice)

| Option has | Group | Rendering |
|---|---|---|
| no image | any | compact text card (+ description if any) |
| image | format, material, finish | large image card (grid) |
| image | any other group (quantity, page count, grammage, …) | compact card with a small inline thumbnail — never a big card |

Selected and focus states are identical for every variant (radio/checkbox
indicator + border + background + weight). When the media's `alt` merely
repeats the option label the thumbnail gets an empty `alt`; any
additional `alt` text is kept. Thumbnails are server-normalized media
(trimmed fields only), loaded lazily at the `thumbnail`/`card` sizes — only
the main preview image is `priority`.

### Main preview resolution

`resolvePreviewMedia({ baseMedia, groups, selection })`
(`src/lib/configurator/preview.ts`, pure and unit-tested):

1. the first selected option that has a `previewImage`, scanning groups in
   the fixed `PREVIEW_PRIORITY` order — **finish, material, format,
   orientation, page count, print sides, colour mode, grammage, quantity**;
   within the multi-select finish group the first *selected* option in CMS
   order wins (click order never matters);
2. otherwise `baseMedia` — the gallery image last chosen (the primary image
   to start with).

Because only inline lists carry `previewImage` today, the practical order
is format → page count → grammage → quantity. A thumbnail-only option never
overrides the preview; deselecting the winner falls through to the next
candidate, then back to the base; "Sur mesure" has no preview so a custom
format can never leave a stale standard-format image; an option with no
preview image (or unresolved media) leaves the current preview in place.

**Gallery interaction:** clicking a gallery thumbnail *pins* that image over
any option override; the next option change re-evaluates the override. While
an option's preview is showing, no gallery thumbnail is marked active.

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
- **Imagery is authored, not seeded.** The fields exist (formats, page
  counts, grammages, quantities; materials/finishes thumbnails) but no
  option image or preview is invented or seeded — products stay text-only
  until editors upload real media. Orientation, print sides and colour mode
  have no CMS imagery.
- **No product-specific material/finish previews** (see above).
- **Specialized product-family dimensions are not modelled** (packaging,
  labels, roll-ups, signage…). The generic `Products` model only describes
  the groups above; the engine renders what the CMS provides and degrades
  to just the preview + CTA for products with none (which is every seeded
  product today). Image enrichment applies to the existing generic groups
  only; specialized product-family configuration remains a future
  content-model task.
- **No dependencies between options** (e.g. finish X only on material Y):
  the CMS does not encode them, so none are invented.
- No pricing, cart, payment, availability or lead-time logic.

## Tests

`tests/unit/configuratorData.spec.ts` (normalizer, incl. visual metadata),
`configuratorPreview.spec.ts` (preview resolver),
`configuratorState.spec.ts` (state/summary/link),
`ProductConfigurator.spec.tsx` (rendered semantics and interaction),
`tests/integration/productOptionMedia.int.spec.ts` (legacy label-only rows,
thumbnail/preview persistence, no pricing exposure),
`tests/e2e/productConfigurator.e2e.spec.ts` (journey through to the quote
page, keyboard, custom format, no-config product, category archive, mobile
overflow). The seed publishes no products and gives none any configuration,
so the e2e suite creates and removes its own fixtures
(`tests/helpers/configuratorFixture.ts`).
