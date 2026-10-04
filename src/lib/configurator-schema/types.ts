import type { DataStatus, Provenance } from './constants'
import type { DimensionDefinition, MappingConfidence } from './dimensionCatalog'
import type { SourceKind } from './sources'

/** One row of a legacy image-capable option list, reduced to plain data. */
export interface LegacyOptionRow {
  label: string
  description?: string | null
  imageId?: number | null
  previewImageId?: number | null
}

/** Allowlist of an existing `configurationSchema` row, reduced to counts + facts. */
export interface ExistingSchemaRow {
  dimensionKey: string
  dataStatus: DataStatus
  source?: Provenance | null
  allowCustomValue: boolean
  /** Catalog option values already bound (machine values). */
  optionValues: string[]
  materialIds: number[]
  finishIds: number[]
  enumValues: string[]
}

/** Everything the audit/backfill planner needs to know about one product. */
export interface ProductSnapshot {
  id: number
  slug: string
  title: string
  status?: string | null
  categorySlug?: string
  categoryTitle?: string
  /** Rich-text long description (for the "À configurer :" fallback). */
  description?: unknown
  legacy: {
    formats: LegacyOptionRow[]
    customFormatAvailable: boolean
    orientations: string[]
    pageCounts: LegacyOptionRow[]
    printSides: string[]
    colorModes: string[]
    materialIds: number[]
    grammages: LegacyOptionRow[]
    finishIds: number[]
    quantities: LegacyOptionRow[]
  }
  schema: ExistingSchemaRow[]
}

export type ReviewStatus =
  | 'missing-values'
  | 'ambiguous-dimension'
  | 'conflicting-source'
  | 'unmapped-legacy-value'
  | 'missing-product-source'

export interface ReviewItem {
  category: string
  productSlug: string
  productTitle: string
  dimensionKey?: string
  dimensionLabel?: string
  status: ReviewStatus
  /** Human-readable provenance of the dimension ("master content (seed)", …). */
  source: string
  /** Option values that already exist (labels). */
  existingValues: string[]
  action: string
  notes?: string
}

export interface PlannedOptionBinding {
  value: string
  description?: string | null
  imageId?: number | null
  previewImageId?: number | null
}

export interface PlannedRow {
  dimension: DimensionDefinition
  action: 'create' | 'fill-existing'
  dataStatus: DataStatus
  source: Provenance
  allowCustomValue: boolean
  /** Display wording taken from the source when it differs from the registry label. */
  labelOverride?: string
  options: PlannedOptionBinding[]
  materialIds: number[]
  finishIds: number[]
  enumOptions: string[]
}

export interface ProductPlan {
  productId: number
  slug: string
  title: string
  category: string
  sourceKind?: SourceKind
  /** Source dimensions with their canonical mapping, in source order. */
  authoritative: { raw: string; key: string; label: string; confidence: MappingConfidence; note?: string }[]
  rows: PlannedRow[]
  review: ReviewItem[]
  /** Values taken from legacy fields into planned rows (options + relations + enums). */
  legacyValuesMigrated: number
  /** True when applying the plan would change nothing. */
  noop: boolean
}
