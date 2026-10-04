# Product technical schema (Sprint 5)

Every Printcom product has its **own** technical dimensions and its **own**
allowed values. A business card is configured by format, orientation,
support, grammage, recto-verso and finish; an envelope by format, window,
closure, paper and the position of the elements; a roll label by width,
core, winding direction, shape, spacing and quantity. The master content
says so explicitly, product by product (« À configurer : … »).

## Why category profiles were rejected

The obvious shortcut — "Papeterie gets profile P, every product in the
category inherits P" — is technically wrong and was rejected:

- products in one category do not share dimensions (letterhead has margins
  and printer compatibility; business cards have orientation; folders have
  flaps and a card notch);
- inheriting *values* would publish technical claims nobody confirmed (a
  format, a grammage, an adhesive offered on a product that does not offer
  it);
- an allowlist shared across products can only ever be the union of what
  they offer, which is false for each of them.

A category is used for **reporting only**: grouping the audit, batching
review work, filtering the admin. It never supplies a dimension or a value.

## Model

```text
Technical Dimension Registry      configurator-dimensions   what can be asked
        +
Reusable Option Catalog           configurator-options      values identical wherever used
        +  (materials / finishes keep their own collections)
Product-specific schema           products.configurationSchema   this product's dimensions + allowlists
        ↓
normalizeProductConfigurationSchema() → ConfiguratorGroup[] → ProductConfigurator
```

### `configurator-dimensions` — the registry

One document per kind of question: `key` (stable, `page-count`, `fenetre`,
`adhesif`…), French `label`, `group` (size / print / material /
construction / finishing / application / quantity / other — a filter, never
a value), `valueType` (`single-choice`, `multi-choice`, `dimensions`,
`number`, `text`, `boolean`), `optionSource` (`catalog`, `materials`,
`finishes`, `enum`, `custom`), optional `unit`, `publicHelpText`, `sortOrder`
and a `draft/published` status. A dimension says *what is asked*, never
*which values exist*. The nine **core** dimensions — `format`,
`orientation`, `page-count`, `print-sides`, `color-mode`, `material`,
`grammage`, `finish`, `quantity` — are ordinary registry entries; they are
the only ones that also fill the historical quote fields.

### `configurator-options` — the shared catalog

One document per value that is technically identical wherever it appears
(`A4`, `350 g`, `Spirale`): `dimension`, `label`, `machineValue` (unique per
dimension, enforced by a validator), optional description/image,
`verificationStatus` (only `confirmed` renders) and `status`. A catalog
option belongs to **no** product by itself. **Materials and finishes are not
duplicated**: `material`/`finish`-type dimensions point at the existing
`materials` / `finishes` collections.

### `products.configurationSchema` — the authority

An ordered array; **one row = one dimension of this product**, and the array
order is the order in the configurator. Each row has:

| Field | Meaning |
|---|---|
| `dimension` | registry entry |
| `labelOverride` / `helpTextOverride` | wording specific to the product (the backfill keeps the source's wording, e.g. « Pagination », « Recto-verso ») |
| `dataStatus` | `confirmed` (rendered) · `needs-review` (hidden) · `unsupported` (hidden) |
| `source` | provenance of the row (see below) |
| `allowCustomValue` | the customer may type a value: « Sur mesure » format, a measure, a number, a text |
| `requiredForConfiguration` | information only — the CTA is never blocked |
| `options[]` | this product's allowlist of catalog options, each with `descriptionOverride`, `imageOverride`, `previewImage` (Sprint 3 metadata) |
| `materialOptions[]`, `finishOptions[]` | allowlist from the shared collections |
| `enumOptions[]` | allowlist of fixed values (orientation, recto-verso, couleur) |

Invariants: a product never inherits another product's rows; products reuse
global options without sharing allowlists (A4 can be allowed on cards and
documents but not on a label); an unconfirmed dimension renders **no
control** — "window" is a known dimension, but which window formats Printcom
offers is unknown, so no selector exists until someone confirms values.

### Requiredness is never guessed

`requiredForConfiguration` defaults to `false`. Sprint 2/4 behaviour is
unchanged: a customer may submit a partial configuration; unknown
selections are simply omitted and Printcom confirms details afterwards.

## What renders (and what does not)

`normalizeProductConfigurationSchema` turns rows into the existing
`ConfiguratorGroup[]`, so the UI is not duplicated. A row becomes a control
only when **all** of this holds:

- the dimension is `published` and the row is `confirmed`;
- choice dimensions have at least one allowed value: catalog options must be
  `published`, `verificationStatus: confirmed` **and** belong to the row's
  own dimension; materials/finishes must be `published`; enum values must
  have a known French label;
- typed dimensions (`dimensions`, `number`, `text`) need an explicit
  `allowCustomValue`; a `boolean` needs only the confirmed row;
- the product page falls back to the legacy generic fields (below) only when
  **no** row yields a control.

Typed controls: `dimensions` → width / height / optional depth + mm|cm;
`number` → a positive number with the dimension's unit; `text` → ≤ 80
characters, no personal data; `boolean` → "Oui". Ambiguous dimensions stay
`needs-review` and never render.

## Provenance and data quality

Every row records where it came from (`source`): `master-content`,
`seed-source`, `existing-cms`, `existing-product-field`, `existing-enum`,
`shared-material`, `shared-finish`, `manual`, `import`. Statuses are
explicit: `confirmed`, `needs-review`, `unsupported`. **"Not yet
configured" is never conflated with "not applicable"**: no source declares a
dimension inapplicable to a product, so the audit never writes
"not applicable" (`notApplicable` is always empty); a row a human sets to
`unsupported` is the only way to say "this product does not do this".

## Authoritative sources

Dimension *names* come from, in priority order:

1. a master-content markdown (`--master <path>` or
   `docs/source/PRINTCOM-MASTER-WEBSITE-CONTENT-FR.md` when present — **not
   in this repository**). The parser reads the nearest heading above an
   `À configurer :` / `Les choix qui structurent le projet :` list (inline,
   bulleted, or as a label/heading followed by bullets) and ignores the
   `Données CMS à afficher si confirmées` block;
2. `src/lib/seed/content/products.ts` (`PRODUCT_SOURCES[].configure`) — the
   transcription of master content §7–8, covering the 79 catalogue products;
3. the `À configurer : …` line already stored in the product's long
   description.

Disagreement between two sources is a `conflicting-source` review item.
Sources give **names only**; "Product technical characteristics describe
configuration dimensions, not guaranteed availability". The 15 *Goodies*
products have no source at all (`missing-product-source`).

### Canonical mapping (reviewed, never naive)

`src/lib/configurator-schema/dimensionCatalog.ts`:

- a reviewed synonym table maps wording to the core dimensions
  (`pagination` / `nombre de pages` → `page-count`; `recto-verso` →
  `print-sides`; `support(s)` → `material`; `finition` → `finish`;
  `quantité` → `quantity`; `dimensions` → `dimensions`);
- terms that overlap several concepts keep their **own** key and are flagged
  `ambiguous-dimension`: `papier`, `carton`, `matière`, `matériaux`,
  `impression`, `couleur`, `mesures`, `surface`, and anything bundling
  alternatives (`carton ou rigide`, `intérieur/extérieur`…);
- every other term becomes its own specialized dimension keyed by the French
  slug of the term (`fenetre`, `adhesif`, `format-ferme`, `pelliculage`,
  `sens-d-enroulement`…) — a pure transcription, no translation, no
  semantic guess. `format` / `format fermé` / `format ouvert` /
  `format de planche` stay four dimensions; `pelliculage` is not `finish`;
  `tirage` is not `quantity`.

## Backfill

`pnpm configurator:backfill` (dry-run) / `--write` (local database only).
For every product it plans rows from (1) the authoritative source and (2)
the values already in the legacy fields:

- every source dimension gets a row, in source order;
- legacy values of a core dimension become that row's allowlist, `confirmed`
  (formats, page counts, grammages, quantities → shared catalog options whose
  `machineValue` is the exact legacy label, so Sprint 4 `cfg` values keep
  matching; orientations / recto-verso / colours → `enumOptions`; materials /
  finishes → the existing relationships; « Sur mesure » →
  `allowCustomValue`);
- Sprint 3 `description`, `image`, `previewImage` move onto the product's
  own binding (`descriptionOverride`, `imageOverride`, `previewImage`);
- a dimension without values → `needs-review` row + a `missing-values`
  review item. **No option is ever created from industry knowledge.**

Safety: idempotent; additive only; manual rows are never overwritten (the
only update is filling a still-empty `needs-review` row an earlier backfill
created, when legacy values have appeared since); nothing is deleted;
publication status is untouched; each product is updated atomically
(find-or-create for registry entries, then one `update` of that product),
so an interrupted run is simply re-run. `updatedAt` follows Payload's normal
behaviour. Writes are **refused against any non-local database** unless
`CONFIGURATOR_ALLOW_REMOTE_WRITE=1` is set after a separate authorization —
never run the write mode against production by accident.

Output (`pnpm configurator:backfill`): products scanned/changed, rows
created/filled, legacy values migrated, dimensions created/reused, shared
options created/reused, review items.

## Review queue and bulk workflow

`pnpm configurator:audit` writes `data/configurator/`:

| File | Content |
|---|---|
| `product-audit.json` / `.md` | every product: source dimensions with provenance + mapping confidence, existing legacy values, schema rows, planned rows, missing / unsupported dimensions, conflicts, state |
| `review-required.json` / `.md` | the **single manual work list**, grouped category → product: `missing-values`, `ambiguous-dimension`, `conflicting-source`, `unmapped-legacy-value`, `missing-product-source` |
| `review-export.csv` | the bulk-editing sheet (`pnpm configurator:export-review`) |

The review queue is derived from the *effective* state: a dimension still
waiting for values stays listed after a backfill (idempotence never hides
work).

Bulk loop — no per-product clicking in Payload:

```bash
pnpm configurator:audit                                   # what is missing, and why
pnpm configurator:export-review                           # → data/configurator/review-export.csv (or --format json)
# edit the sheet: fill `value` (+ `value_label`) and set `status` to confirmed
pnpm configurator:import-review --file edited.csv         # dry-run: validation + diff, writes nothing
pnpm configurator:import-review --file edited.csv --write # applies (local DB; additive)
```

Columns: `category, product_slug, product_title, dimension_key,
dimension_label, value, value_label, status, notes` — stable slugs only, no
ids. `value` is a catalog value, a material/finish **slug**, an enum value,
or `__custom__` (allow customer input). Rows with an empty `value` are
informational. The importer rejects unknown products, dimensions, materials,
finishes and enum values, unknown statuses and columns, labels that
contradict an existing shared option, conflicting duplicates and
contradictory statuses; it prints the diff first, never deletes anything,
never touches fields it was not given, and a second run changes nothing.

## Transport: `cfg` v1 / v2

Sprint 4 URLs carry `cfg=1.<payload>` (fixed keys for the nine core
dimensions). They keep working: v1 is parsed into the generic structure and
canonicalized against the product's allowlist exactly like v2 — never
reinterpreted. v2 (`cfg=2.<payload>`, emitted from now on, including by
« Modifier ») is generic: maps keyed by dimension key — `s` single values,
`m` multi-choice lists, `c` custom format, `d` measures
`[width,height,depth,unit]`, `n` numbers, `t` short texts, `b` booleans.
Deterministic (sorted keys), URL-safe, ≤ 4000 characters, no PII, strict
schema; unknown versions and malformed payloads fail closed.

The server canonicalizes **every** transported entry against the product's
current allowlist: the dimension must belong to the product, the value must
be offered by that exact product, the kind must match the dimension's type,
custom values must be allowed by the row, measures and numbers must be
positive numbers. Never trusted: dimension keys, option values, custom
units, relationship slugs.

## Quote persistence

Core dimensions keep filling the structured `quote-requests.configuration`
fields (`format`, `customFormat*`, `orientation`, `pageCount`, `printSides`,
`color`, `material`, `grammage`, `finish[]`, `quantity` — see
`docs/quote-workflow.md`). Every **other** dimension is snapshotted in
`configuration.technicalSelections[]` (`key`, `label`, `valueLabel`,
`valueLabels`, `numericValue`, `unit`): resolved server-side, in the
product's schema order, with French labels, so a lead stays readable if the
CMS changes later. It is read-only in the admin, shown in the admin PDF, and
the same canonical rows feed the checkout summary and the internal e-mail.
Migration `20261004_041851_product_technical_schema` is additive; old
quote records are untouched.

## Legacy fields and fallback

The Sprint 2 fields (`availableFormats`, `customFormatAvailable`,
`orientations`, `pageCountOptions`, `printSides`, `colorModes`, `materials`,
`grammages`, `finishes`, `quantities`) are **kept and still readable**:

```text
Phase A  legacy fields + configurationSchema coexist                  ← this sprint
Phase B  backfill the schema from legacy values + source dimensions   ← pnpm configurator:backfill
Phase C  frontend reads the schema first, legacy adapter as fallback  ← this sprint
Phase D  remove legacy fields — only after a production audit         ← future, not done
```

A product whose schema has no usable row renders exactly as before. Once a
product has any usable schema row the schema is the single definition — the
backfill copies every legacy value, so nothing is lost; if a legacy-only
value is added later it must be added to the schema (or re-run the
backfill, which fills rows that do not exist yet).

## Known limitations

- The master-content file itself is not in the repository; names come from
  its seed transcription. Run the audit with `--master` once the file is
  available to cross-check (disagreements surface as `conflicting-source`).
- No option value exists for any specialized dimension: by design every
  seeded product is `needs-review` until values are confirmed through the
  import loop. Until then product pages look as before (legacy fallback / no
  controls).
- Group/valueType of specialized dimensions default to `other` /
  `single-choice` (only `dimensions` is typed); refine them in the registry
  when values are confirmed.
- The admin shows rows as a native array (no custom row labels or
  conditional fields): the dimension is a relationship, so allowlist fields
  that do not apply to its source type are simply left empty.
- Dimension-to-dimension dependencies (finish X only on material Y) are not
  modelled.
