import { ENUM_LABELS_BY_DIMENSION } from '@/lib/configurator/labels'
import { CORE_DIMENSION_KEYS as KEYS } from '@/lib/configurator/types'
import type { Provenance } from './constants'
import {
  CORE_DIMENSIONS,
  canonicalizeDimension,
  normalizeTerm,
  type CanonicalDimension,
  type DimensionDefinition,
} from './dimensionCatalog'
import { resolveProductSource, type ProductSource, type ResolvedProductSource, type SourceKind } from './sources'
import type {
  ExistingSchemaRow,
  LegacyOptionRow,
  PlannedOptionBinding,
  PlannedRow,
  ProductPlan,
  ProductSnapshot,
  ReviewItem,
  ReviewStatus,
} from './types'

const SOURCE_LABELS: Record<SourceKind, string> = {
  'master-content': 'contenu maître',
  'seed-source': 'contenu maître (transcription seed)',
  'existing-cms': 'description produit existante',
}

/** Legacy values of one core dimension, in the shape a planned row needs. */
interface LegacyValues {
  options: PlannedOptionBinding[]
  materialIds: number[]
  finishIds: number[]
  enumOptions: string[]
  allowCustomValue: boolean
  provenance: Provenance
  /** Raw enum values the label maps don't know. */
  unmapped: string[]
}

const emptyValues = (provenance: Provenance): LegacyValues => ({
  options: [],
  materialIds: [],
  finishIds: [],
  enumOptions: [],
  allowCustomValue: false,
  provenance,
  unmapped: [],
})

function bindings(rows: LegacyOptionRow[]): PlannedOptionBinding[] {
  const seen = new Set<string>()
  const result: PlannedOptionBinding[] = []
  for (const row of rows) {
    const value = row.label?.trim()
    if (!value || seen.has(value)) continue
    seen.add(value)
    result.push({
      value,
      description: row.description?.trim() || undefined,
      imageId: row.imageId ?? undefined,
      previewImageId: row.previewImageId ?? undefined,
    })
  }
  return result
}

function enumValues(key: string, values: string[]): Pick<LegacyValues, 'enumOptions' | 'unmapped'> {
  const known = ENUM_LABELS_BY_DIMENSION[key] ?? {}
  const unique = [...new Set(values)]
  return { enumOptions: unique.filter((value) => known[value]), unmapped: unique.filter((value) => !known[value]) }
}

/** What the product's historical generic fields hold for a core dimension. */
export function legacyValuesFor(snapshot: ProductSnapshot, key: string): LegacyValues | undefined {
  const { legacy } = snapshot
  let values: LegacyValues | undefined
  switch (key) {
    case KEYS.format:
      values = { ...emptyValues('existing-product-field'), options: bindings(legacy.formats), allowCustomValue: legacy.customFormatAvailable }
      break
    case KEYS.orientation:
      values = { ...emptyValues('existing-enum'), ...enumValues(key, legacy.orientations) }
      break
    case KEYS.pageCount:
      values = { ...emptyValues('existing-product-field'), options: bindings(legacy.pageCounts) }
      break
    case KEYS.printSides:
      values = { ...emptyValues('existing-enum'), ...enumValues(key, legacy.printSides) }
      break
    case KEYS.colorMode:
      values = { ...emptyValues('existing-enum'), ...enumValues(key, legacy.colorModes) }
      break
    case KEYS.material:
      values = { ...emptyValues('shared-material'), materialIds: [...new Set(legacy.materialIds)] }
      break
    case KEYS.grammage:
      values = { ...emptyValues('existing-product-field'), options: bindings(legacy.grammages) }
      break
    case KEYS.finish:
      values = { ...emptyValues('shared-finish'), finishIds: [...new Set(legacy.finishIds)] }
      break
    case KEYS.quantity:
      values = { ...emptyValues('existing-product-field'), options: bindings(legacy.quantities) }
      break
  }
  return values
}

const countValues = (values: LegacyValues) =>
  values.options.length + values.materialIds.length + values.finishIds.length + values.enumOptions.length

const hasValues = (values: LegacyValues | undefined): values is LegacyValues =>
  Boolean(values && (countValues(values) > 0 || values.allowCustomValue))

/** Core dimensions in the historical group order — used for legacy-only dimensions. */
const LEGACY_ORDER = [
  KEYS.format,
  KEYS.orientation,
  KEYS.pageCount,
  KEYS.printSides,
  KEYS.colorMode,
  KEYS.material,
  KEYS.grammage,
  KEYS.finish,
  KEYS.quantity,
]

function capitalize(value: string): string {
  const trimmed = value.trim()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

const PRODUCT_LEVEL_NOTE = 'Aucune source de dimensions pour ce produit.'

/**
 * Plans the product-specific `configurationSchema` rows for one product.
 * Pure: reads the snapshot + resolved source, returns a plan. Rules:
 *
 *  - every dimension named by the source gets a row, in source order;
 *  - a core dimension with legacy values gets those values (confirmed);
 *  - a dimension with no values is `needs-review` and listed for review —
 *    no option is ever fabricated;
 *  - ambiguous wording gets its own `needs-review` row plus an
 *    `ambiguous-dimension` item;
 *  - legacy values for a dimension the source doesn't name are kept
 *    (confirmed) and flagged `conflicting-source`;
 *  - an existing schema row is never touched, except to fill a still-empty
 *    `needs-review` row that an earlier backfill created from the source;
 *  - the category plays no part.
 */
export function planProduct(snapshot: ProductSnapshot, resolved: ResolvedProductSource): ProductPlan {
  const category = snapshot.categoryTitle ?? snapshot.categorySlug ?? '—'
  const source = resolved.source
  const review: ReviewItem[] = []
  const item = (partial: Partial<ReviewItem> & Pick<ReviewItem, 'status' | 'action'>): ReviewItem => ({
    category,
    productSlug: snapshot.slug,
    productTitle: snapshot.title,
    source: source ? SOURCE_LABELS[source.kind] : 'aucune',
    existingValues: [],
    ...partial,
  })

  // 1. Source dimensions → canonical dimensions (deduplicated by key, source order).
  const authoritative: ProductPlan['authoritative'] = []
  const canonical: CanonicalDimension[] = []
  for (const raw of source?.dimensions ?? []) {
    const entry = canonicalizeDimension(raw)
    if (canonical.some((existing) => existing.definition.key === entry.definition.key)) continue
    canonical.push(entry)
    authoritative.push({
      raw,
      key: entry.definition.key,
      label: entry.definition.label,
      confidence: entry.confidence,
      note: entry.note,
    })
  }

  if (!source) {
    review.push(item({ status: 'missing-product-source', action: 'Fournir la liste des dimensions techniques de ce produit.', notes: PRODUCT_LEVEL_NOTE }))
  }
  if (resolved.conflict) {
    review.push(
      item({
        status: 'conflicting-source',
        action: 'Arbitrer entre les deux listes de dimensions.',
        notes: `La source « ${SOURCE_LABELS[resolved.conflict.kind]} » indique : ${resolved.conflict.dimensions.join(', ')}.`,
      }),
    )
  }

  const existing = new Map<string, ExistingSchemaRow>(snapshot.schema.map((row) => [row.dimensionKey, row]))
  const rows: PlannedRow[] = []
  let legacyValuesMigrated = 0

  const planRow = (definition: DimensionDefinition, entry: CanonicalDimension | undefined) => {
    const legacyValues = legacyValuesFor(snapshot, definition.key)
    const usable = hasValues(legacyValues) ? legacyValues : undefined
    const current = existing.get(definition.key)
    const wording = entry && normalizeTerm(entry.raw) !== normalizeTerm(definition.label) ? capitalize(entry.raw) : undefined

    if (usable?.unmapped.length) {
      review.push(
        item({
          status: 'unmapped-legacy-value',
          dimensionKey: definition.key,
          dimensionLabel: definition.label,
          existingValues: usable.unmapped,
          action: 'Ces valeurs n’ont pas de libellé connu : les confirmer ou les retirer.',
        }),
      )
    }

    const fillable =
      current &&
      current.dataStatus === 'needs-review' &&
      (current.source === 'master-content' || current.source === 'seed-source' || current.source === 'existing-cms') &&
      !current.optionValues.length &&
      !current.materialIds.length &&
      !current.finishIds.length &&
      !current.enumValues.length &&
      Boolean(usable)
    const waiting = () => {
      const ambiguous = entry?.confidence === 'ambiguous'
      const typed = ['dimensions', 'number', 'text'].includes(definition.valueType)
      review.push(
        item({
          status: ambiguous ? 'ambiguous-dimension' : 'missing-values',
          dimensionKey: definition.key,
          dimensionLabel: entry ? capitalize(entry.raw) : definition.label,
          action: ambiguous
            ? 'Confirmer la signification de cette dimension puis ses valeurs autorisées.'
            : typed
              ? 'Confirmer si le client peut saisir cette dimension pour ce produit (saisie libre autorisée).'
              : 'Confirmer les valeurs autorisées pour ce produit.',
          notes: ambiguous ? entry?.note : 'Dimension issue de la source ; aucune valeur confirmée dans le CMS.',
        }),
      )
    }

    if (current && !fillable) {
      // Manual / richer row: never overwritten. A row that is still waiting
      // for values stays on the review queue — idempotence must not hide work.
      const stillEmpty =
        current.dataStatus === 'needs-review' &&
        !current.optionValues.length &&
        !current.materialIds.length &&
        !current.finishIds.length &&
        !current.enumValues.length &&
        !current.allowCustomValue
      if (stillEmpty) waiting()
      return
    }

    const base = {
      dimension: definition,
      action: current ? ('fill-existing' as const) : ('create' as const),
      labelOverride: wording,
    }

    if (usable) {
      legacyValuesMigrated += countValues(usable)
      rows.push({
        ...base,
        dataStatus: 'confirmed',
        source: usable.provenance,
        allowCustomValue: usable.allowCustomValue,
        options: usable.options,
        materialIds: usable.materialIds,
        finishIds: usable.finishIds,
        enumOptions: usable.enumOptions,
      })
      return
    }

    if (current) return // fillable row but no legacy values yet: stays as is
    rows.push({
      ...base,
      dataStatus: 'needs-review',
      source: source?.kind ?? 'manual',
      allowCustomValue: false,
      options: [],
      materialIds: [],
      finishIds: [],
      enumOptions: [],
    })
    waiting()
  }

  // 2. Source dimensions, in source order.
  for (const entry of canonical) planRow(entry.definition, entry)

  // 3. Legacy values for core dimensions the source doesn't name.
  const named = new Set(canonical.map((entry) => entry.definition.key))
  for (const key of LEGACY_ORDER) {
    if (named.has(key) || !hasValues(legacyValuesFor(snapshot, key))) continue
    planRow(CORE_DIMENSIONS[key], undefined)
    // Still flagged after a backfill (the row it created carries a legacy-field
    // provenance); a row a human wrote or edited has settled the question.
    const current = existing.get(key)
    const settledByHuman = current && (current.source === 'manual' || current.source === 'import')
    if (source && !settledByHuman) {
      review.push(
        item({
          status: 'conflicting-source',
          dimensionKey: key,
          dimensionLabel: CORE_DIMENSIONS[key].label,
          existingValues: legacyValuesSummary(snapshot, key),
          action: 'Des valeurs existent pour une dimension absente de la source : confirmer qu’elle s’applique à ce produit.',
        }),
      )
    }
  }

  // 4. Ambiguous source terms that overlap legacy values the product already has.
  for (const entry of canonical) {
    if (entry.confidence !== 'ambiguous') continue
    const overlapKey = overlappingCoreKey(entry.raw)
    if (overlapKey && hasValues(legacyValuesFor(snapshot, overlapKey))) {
      const target = review.find((candidate) => candidate.dimensionKey === entry.definition.key && candidate.status === 'ambiguous-dimension')
      const note = `Des valeurs « ${CORE_DIMENSIONS[overlapKey].label} » existent déjà : confirmer si « ${entry.raw} » désigne la même dimension.`
      if (target) target.notes = `${target.notes ?? ''} ${note}`.trim()
      else
        review.push(
          item({ status: 'ambiguous-dimension', dimensionKey: entry.definition.key, dimensionLabel: capitalize(entry.raw), action: 'Confirmer la signification de cette dimension.', notes: note }),
        )
    }
  }

  return {
    productId: snapshot.id,
    slug: snapshot.slug,
    title: snapshot.title,
    category,
    sourceKind: source?.kind,
    authoritative,
    rows,
    review,
    legacyValuesMigrated,
    noop: rows.length === 0,
  }
}

const OVERLAPS: Record<string, string> = {
  papier: KEYS.material,
  carton: KEYS.material,
  matiere: KEYS.material,
  matieres: KEYS.material,
  materiaux: KEYS.material,
  impression: KEYS.printSides,
  couleur: KEYS.colorMode,
  couleurs: KEYS.colorMode,
}

function overlappingCoreKey(raw: string): string | undefined {
  return OVERLAPS[normalizeTerm(raw)]
}

function legacyValuesSummary(snapshot: ProductSnapshot, key: string): string[] {
  const values = legacyValuesFor(snapshot, key)
  if (!values) return []
  return [
    ...values.options.map((option) => option.value),
    ...values.enumOptions,
    ...(values.materialIds.length ? [`${values.materialIds.length} support(s)`] : []),
    ...(values.finishIds.length ? [`${values.finishIds.length} finition(s)`] : []),
    ...(values.allowCustomValue ? ['Sur mesure'] : []),
  ]
}

export function planProducts(
  snapshots: ProductSnapshot[],
  options: { master?: ProductSource[]; seed?: ProductSource[] } = {},
): ProductPlan[] {
  return [...snapshots]
    .sort((a, b) => (a.categorySlug ?? '').localeCompare(b.categorySlug ?? '') || a.slug.localeCompare(b.slug))
    .map((snapshot) =>
      planProduct(
        snapshot,
        resolveProductSource({
          slug: snapshot.slug,
          title: snapshot.title,
          description: snapshot.description,
          master: options.master,
          seed: options.seed,
        }),
      ),
    )
}

export type { ReviewStatus }
